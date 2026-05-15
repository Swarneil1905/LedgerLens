import asyncio
import logging
import os
from collections import OrderedDict
from collections.abc import AsyncGenerator
from contextlib import suppress
from dataclasses import dataclass
from typing import Literal

from llm.config import get_llm_settings
from llm.followups import (
    FOLLOWUP_SYSTEM,
    build_followup_user_message,
    parse_followup_json,
    template_followups,
)
from llm.groq_client import complete_groq_chat, stream_groq_chat
from llm.ollama import complete_ollama_chat, stream_ollama_chat
from llm.context_cleanup import focus_excerpt_on_question, scrub_excerpt_text
from llm.prompts import SYSTEM_PROMPT, build_answer_prompt, build_ollama_message_list
from llm.streaming import format_sse
from memory.persistence import append_chat_message, get_chat_history, list_workspace_charts
from retrieval.assembler import RetrievedContext, assemble_context
from retrieval.query import question_prefers_periodic_filings
from schemas.chat import ChatQueryRequest
from schemas.source import SourceResponse, SourceType

logger = logging.getLogger(__name__)

MAX_STREAM_SECONDS = 45
GROQ_CONTEXT_MAX_CHARS = 6000
GROQ_RETRY_MAX_TOKENS = 400

_followup_cache: OrderedDict[str, list[str]] = OrderedDict()


def _followup_cache_key(ticker: str, question: str) -> str:
    return f"{ticker}:{question[:80]}"


def _followup_cache_get(key: str) -> list[str] | None:
    if key not in _followup_cache:
        return None
    return list(_followup_cache[key])


def _followup_cache_set(key: str, value: list[str]) -> None:
    if key in _followup_cache:
        del _followup_cache[key]
    _followup_cache[key] = list(value)
    if len(_followup_cache) > 100:
        for _ in range(20):
            if not _followup_cache:
                break
            _followup_cache.popitem(last=False)


async def _resolve_follow_ups_with_cache(
    settings,
    request: ChatQueryRequest,
    sources: list[SourceResponse],
    answer: str,
) -> list[str]:
    key = _followup_cache_key(request.ticker, request.question)
    hit = _followup_cache_get(key)
    if hit is not None:
        return hit
    out = await _resolve_follow_ups(settings, request, sources, answer)
    _followup_cache_set(key, out)
    return out


async def generate_grounded_answer(request: ChatQueryRequest) -> AsyncGenerator[str, None]:
    prior_messages = get_chat_history(request.session_id)
    context = await assemble_context(request.question, request.ticker)
    chunks_are_empty = not context.chunks or all(not str(c).strip() for c in context.chunks)
    web_enabled = os.getenv("ENABLE_WEB_SEARCH", "false").lower() == "true"
    if web_enabled and chunks_are_empty:
        logger.info(
            "No indexed chunks for ticker=%s — falling back to live web search",
            request.ticker,
        )
    if web_enabled:
        try:
            from data_sources.web_search import fetch_web_search, web_rows_to_source_responses

            web_rows = await fetch_web_search(request.question, request.ticker)
            web_sources = web_rows_to_source_responses(request.ticker, web_rows)
            web_chunks: list[str] = []
            for row in web_rows[:4]:
                if not isinstance(row, dict):
                    continue
                title = str(row.get("title") or "").strip() or "(untitled)"
                snippet = str(row.get("snippet") or "").strip()
                if snippet:
                    line = f"[WEB: {title}] {snippet}".strip()
                    web_chunks.append(line[:2000])
                elif title:
                    web_chunks.append(f"[WEB: {title}]"[:2000])
            new_chunks = web_chunks + list(context.chunks)
            new_sources = list(web_sources[:3]) + list(context.sources)
            context = context.model_copy(update={"chunks": new_chunks, "sources": new_sources})
        except Exception as exc:
            logger.warning("Live web search failed: %s", exc)
    sources = _filter_sources(context.sources, request.source_filters)
    periodic_filing_q = question_prefers_periodic_filings(request.question)
    append_chat_message(request.session_id, role="user", content=request.question)

    settings = get_llm_settings()
    will_use_llm = settings.provider in ("ollama", "groq") and bool(sources)
    stream_label = settings.provider if will_use_llm else "template"
    meta_payload: dict[str, str | None] = {
        "envLlmProvider": settings.provider,
        "answerStream": stream_label,
    }
    if settings.provider == "ollama":
        meta_payload["ollamaModel"] = settings.ollama_model
    if settings.provider == "groq":
        meta_payload["groqModel"] = settings.groq_model
    yield format_sse("meta", meta_payload)

    answer: str
    followups: list[str]
    ollama_error: str | None = None

    if settings.provider in ("ollama", "groq") and sources:
        parts: list[str] = []
        stream_done = asyncio.Event()
        cache_key = _followup_cache_key(request.ticker, request.question)

        async def followups_worker() -> list[str]:
            hit = _followup_cache_get(cache_key)
            if hit is not None:
                return hit
            await stream_done.wait()
            out = await _resolve_follow_ups(settings, request, sources, "".join(parts))
            _followup_cache_set(cache_key, out)
            return out

        followup_task = asyncio.create_task(followups_worker())
        try:
            logger.info(
                "chat: streaming via %s ticker=%s",
                settings.provider,
                request.ticker,
            )
            rag_body = _format_rag_context(
                context,
                request.question,
                sources_for_prompt=sources,
                filings_only_for_index=periodic_filing_q,
                limits=OLLAMA_RAG_LIMITS,
            )
            web_count = sum(1 for s in sources if s.source_type == SourceType.WEB)
            if web_count > 0:
                context_note = (
                    f"NOTE: {web_count} live web result(s) retrieved for this specific question "
                    "are included below.\n\n"
                )
            else:
                context_note = ""
            context_block = context_note + rag_body
            if settings.provider == "groq":
                ctx_chars = len(context_block)
                logger.info("Groq context block character count: %d", ctx_chars)
                if ctx_chars > GROQ_CONTEXT_MAX_CHARS:
                    slim_ctx = context.model_copy(
                        update={"chunks": list(context.chunks[:3])}
                    )
                    rag_body = _format_rag_context(
                        slim_ctx,
                        request.question,
                        sources_for_prompt=sources,
                        filings_only_for_index=periodic_filing_q,
                        limits=OLLAMA_RAG_LIMITS,
                    )
                    context_block = context_note + rag_body
                    logger.info(
                        "Groq context truncated to top 3 chunks only; new character count: %d",
                        len(context_block),
                    )
            user_prompt = build_answer_prompt(
                request.ticker, request.question, context_block
            )
            ollama_messages = build_ollama_message_list(
                system_prompt=SYSTEM_PROMPT.strip(),
                prior_turns=prior_messages,
                current_user_content=user_prompt,
            )
            if settings.provider == "ollama":
                stream_iter = stream_ollama_chat(
                    base_url=settings.ollama_base_url,
                    model=settings.ollama_model,
                    messages=ollama_messages,
                    temperature=settings.ollama_chat_temperature,
                    top_p=settings.ollama_chat_top_p,
                    num_predict=settings.ollama_chat_num_predict,
                    num_ctx=settings.ollama_chat_num_ctx,
                )
                try:
                    async with asyncio.timeout(MAX_STREAM_SECONDS):
                        async for delta in stream_iter:
                            parts.append(delta)
                            yield format_sse("text", {"chunk": delta})
                except asyncio.TimeoutError:
                    logger.warning(
                        "LLM stream timed out after %ss — retrying with reduced context",
                        MAX_STREAM_SECONDS,
                    )
                    parts.clear()
                    reduced_block = _format_rag_context(
                        context,
                        request.question,
                        sources_for_prompt=sources,
                        filings_only_for_index=periodic_filing_q,
                        limits=REDUCED_RAG_LIMITS,
                    )
                    reduced_block = context_note + reduced_block
                    user_prompt_retry = build_answer_prompt(
                        request.ticker, request.question, reduced_block
                    )
                    ollama_messages_retry = build_ollama_message_list(
                        system_prompt=SYSTEM_PROMPT.strip(),
                        prior_turns=prior_messages,
                        current_user_content=user_prompt_retry,
                    )
                    stream_iter_retry = stream_ollama_chat(
                        base_url=settings.ollama_base_url,
                        model=settings.ollama_model,
                        messages=ollama_messages_retry,
                        temperature=settings.ollama_chat_temperature,
                        top_p=settings.ollama_chat_top_p,
                        num_predict=settings.ollama_chat_num_predict,
                        num_ctx=settings.ollama_chat_num_ctx,
                    )
                    async with asyncio.timeout(MAX_STREAM_SECONDS):
                        async for delta in stream_iter_retry:
                            parts.append(delta)
                            yield format_sse("text", {"chunk": delta})
            else:
                stream_iter = stream_groq_chat(
                    messages=ollama_messages,
                    model=settings.groq_model,
                    temperature=settings.ollama_chat_temperature,
                    max_tokens=settings.ollama_chat_num_predict,
                )
                try:
                    async with asyncio.timeout(MAX_STREAM_SECONDS):
                        async for delta in stream_iter:
                            parts.append(delta)
                            yield format_sse("text", {"chunk": delta})
                except Exception as groq_exc:
                    logger.warning(
                        "Groq stream failed (%s); retrying once with shorter prompt",
                        groq_exc,
                    )
                    parts.clear()
                    retry_chunks = _groq_retry_chunks(list(context.chunks))
                    slim_ctx = context.model_copy(update={"chunks": retry_chunks})
                    reduced_block = _format_rag_context(
                        slim_ctx,
                        request.question,
                        sources_for_prompt=sources,
                        filings_only_for_index=periodic_filing_q,
                        limits=REDUCED_RAG_LIMITS,
                    )
                    reduced_block = context_note + reduced_block
                    user_prompt_retry = build_answer_prompt(
                        request.ticker, request.question, reduced_block
                    )
                    ollama_messages_retry = build_ollama_message_list(
                        system_prompt=SYSTEM_PROMPT.strip(),
                        prior_turns=prior_messages,
                        current_user_content=user_prompt_retry,
                    )
                    stream_iter_retry = stream_groq_chat(
                        messages=ollama_messages_retry,
                        model=settings.groq_model,
                        temperature=settings.ollama_chat_temperature,
                        max_tokens=GROQ_RETRY_MAX_TOKENS,
                    )
                    async with asyncio.timeout(MAX_STREAM_SECONDS):
                        async for delta in stream_iter_retry:
                            parts.append(delta)
                            yield format_sse("text", {"chunk": delta})
            answer = "".join(parts)
        except Exception as exc:
            ollama_error = str(exc).strip()[:400]
            logger.exception(
                "%s chat failed; using excerpt fallback (%s)",
                settings.provider,
                ollama_error,
            )
            if not followup_task.done():
                followup_task.cancel()
                with suppress(asyncio.CancelledError):
                    await followup_task
            answer = _compose_answer(
                request.question, request.ticker, sources, answer_mode="ollama_unavailable"
            )
            for token in answer.split(" "):
                yield format_sse("text", {"chunk": f"{token} "})
                await asyncio.sleep(0.008)
            followups = await _resolve_follow_ups_with_cache(
                settings, request, sources, answer
            )
        else:
            stream_done.set()
            followups = await followup_task
    else:
        answer = _compose_answer(
            request.question,
            request.ticker,
            sources,
            answer_mode="excerpts_only",
        )
        for token in answer.split(" "):
            yield format_sse("text", {"chunk": f"{token} "})
            await asyncio.sleep(0.008)
        followups = await _resolve_follow_ups_with_cache(settings, request, sources, answer)

    yield format_sse("sources", {"sources": [source.model_dump(mode="json") for source in sources]})
    yield format_sse("followups", {"followUps": followups})

    charts = list_workspace_charts(request.ticker)
    if charts:
        yield format_sse("chart", {"charts": [charts[0].model_dump(mode="json")]})

    append_chat_message(
        request.session_id,
        role="assistant",
        content=answer,
        follow_ups=followups,
        sources=sources,
    )
    done: dict[str, object] = {"status": "complete"}
    if ollama_error:
        done["ollamaError"] = ollama_error
    yield format_sse("done", done)


def _filter_sources(sources: list[SourceResponse], filters: list[str]) -> list[SourceResponse]:
    normalized = {item.lower() for item in filters if item}
    if not normalized:
        return sources
    return [source for source in sources if source.source_type.value in normalized]


async def _resolve_follow_ups(
    settings,
    request: ChatQueryRequest,
    sources: list[SourceResponse],
    answer: str,
) -> list[str]:
    if not sources:
        return [
            f"Refresh sources for {request.ticker}?",
            "Try a different ticker with existing coverage?",
            "Narrow the question to a single filing topic?",
        ]
    trimmed = answer.strip()
    if settings.provider in ("ollama", "groq") and len(trimmed) > 50:
        try:
            user_content = build_followup_user_message(
                ticker=request.ticker,
                question=request.question,
                answer=trimmed,
                indexed_source_lines=_source_title_lines(sources),
            )
            if settings.provider == "groq":
                raw = await complete_groq_chat(
                    messages=[
                        {"role": "system", "content": FOLLOWUP_SYSTEM.strip()},
                        {"role": "user", "content": user_content},
                    ],
                    model=settings.groq_model,
                    temperature=0.45,
                    max_tokens=380,
                )
            else:
                raw = await complete_ollama_chat(
                    base_url=settings.ollama_base_url,
                    model=settings.ollama_model,
                    system_prompt=FOLLOWUP_SYSTEM.strip(),
                    user_prompt=user_content,
                    temperature=0.45,
                    num_predict=380,
                )
            parsed = parse_followup_json(raw)
            if len(parsed) >= 3:
                return [item[:160] for item in parsed[:3]]
        except Exception:
            logger.debug("LLM follow-up suggestions failed", exc_info=True)
    return template_followups(request.question, request.ticker)


def _source_fallback_chunks(sources: list[SourceResponse]) -> list[str]:
    """When vector search returns nothing, still pass title+snippet so the model has text to cite."""
    out: list[str] = []
    for source in sources[:8]:
        block = f"{source.title.strip()}\n{source.snippet.strip()}".strip()
        if block:
            out.append(block)
    return out


def _source_title_lines(sources: list[SourceResponse]) -> list[str]:
    return [f"- {s.title} ({s.source_type.value})" for s in sources[:8]]


def _source_index_headline(source: SourceResponse) -> str:
    """Short label for the numbered source index (matches source panel expectations)."""
    if source.source_type == SourceType.FILING:
        form = str(source.metadata.get("form_type") or "").strip()
        if form:
            return f"{source.provider} ({form})"
    return source.provider


@dataclass(frozen=True)
class RagFormatLimits:
    """Keeps Ollama prompts inside num_ctx: filing dumps were routinely >80k chars / index-only."""

    max_chunks: int = 6
    max_polished_chunk_chars: int = 1500
    max_index_sources: int = 7
    max_index_snippet_chars: int = 680


OLLAMA_RAG_LIMITS = RagFormatLimits()
REDUCED_RAG_LIMITS = RagFormatLimits(max_chunks=3, max_polished_chunk_chars=800)


def _chunk_looks_like_web_snippet(chunk: str) -> bool:
    return chunk.lstrip().startswith("[WEB:")


def _groq_retry_chunks(chunks: list[str]) -> list[str]:
    """Shorter Groq retry: up to two live-web lines plus one non-web (e.g. SEC) chunk."""
    web = [c for c in chunks if _chunk_looks_like_web_snippet(c)]
    sec = [c for c in chunks if not _chunk_looks_like_web_snippet(c)]
    return web[:2] + sec[:1]


def _format_rag_context(
    context: RetrievedContext,
    question: str,
    *,
    sources_for_prompt: list[SourceResponse] | None = None,
    filings_only_for_index: bool = False,
    limits: RagFormatLimits = OLLAMA_RAG_LIMITS,
) -> str:
    """Build prompt context. For periodic filing questions, omit FRED/news from the numbered
    Source index so small models do not default to “here are three kinds of sources.”
    """
    parts: list[str] = []
    base_sources = sources_for_prompt if sources_for_prompt is not None else context.sources

    chunks = list(context.chunks[: limits.max_chunks])
    if not chunks and base_sources:
        chunks = _source_fallback_chunks(base_sources)[: limits.max_chunks]
    if chunks:
        polished: list[str] = []
        for c in chunks:
            raw_excerpt = scrub_excerpt_text(c)
            excerpt = focus_excerpt_on_question(
                raw_excerpt, question, max_chars=limits.max_polished_chunk_chars
            )
            if len(excerpt) > limits.max_polished_chunk_chars:
                excerpt = f"{excerpt[: limits.max_polished_chunk_chars]}…"
            polished.append(excerpt)
        joined = "\n---\n".join(polished)
        parts.append(f"## Retrieved excerpts\n{joined}")

    if base_sources:
        idx_sources = list(base_sources[: limits.max_index_sources])
        if filings_only_for_index:
            filing_rows = [s for s in idx_sources if s.source_type == SourceType.FILING]
            idx_sources = filing_rows if filing_rows else idx_sources
        lines: list[str] = []
        cap = min(limits.max_index_sources, 10)
        for idx, source in enumerate(idx_sources[:cap], start=1):
            snippet = scrub_excerpt_text(source.snippet.strip())
            snippet = focus_excerpt_on_question(
                snippet, question, max_chars=limits.max_index_snippet_chars
            )
            if len(snippet) > limits.max_index_snippet_chars:
                snippet = f"{snippet[: limits.max_index_snippet_chars]}…"
            lines.append(f"[{idx}] {_source_index_headline(source)}: {snippet}")
        parts.append("## Source index\n" + "\n".join(lines))

    body = "\n\n".join(parts) if parts else "(No context available.)"
    if filings_only_for_index and body != "(No context available.)":
        body += (
            "\n\n(Task for this turn: Answer the Question using the filing excerpts and "
            "index lines above only. Do not summarize SEC vs FRED vs news as categories—give "
            "substantive filing-grounded takeaways. Use indexed citations [1], [2], … that match "
            "the Source index above. Only say prior-period filing data is missing if it appears "
            "in NONE of the excerpts above, including any web-derived lines in the excerpts.)"
        )
    return body


_TEMPLATE_SNIPPET_CHARS = 1400

_ComposeMode = Literal["excerpts_only", "ollama_unavailable"]


def _compose_answer(
    question: str,
    ticker: str,
    sources: list[SourceResponse],
    *,
    answer_mode: _ComposeMode = "excerpts_only",
) -> str:
    if not sources:
        return (
            f"No indexed sources were available for {ticker}. "
            f"Run POST /sources/refresh?ticker={ticker} and retry. Original question: {question}"
        )

    lines: list[str] = []
    for idx, source in enumerate(sources[:5], start=1):
        snip = scrub_excerpt_text(source.snippet.strip())
        snip = focus_excerpt_on_question(snip, question, max_chars=_TEMPLATE_SNIPPET_CHARS)
        if len(snip) > _TEMPLATE_SNIPPET_CHARS:
            snip = f"{snip[:_TEMPLATE_SNIPPET_CHARS]}…"
        lines.append(
            f"- **[{idx}]** {source.provider} ({source.source_type.value}): {snip}"
        )

    if answer_mode == "ollama_unavailable":
        intro = (
            "The assistant could not finish a reply just now, so here are **short highlights** "
            "from the indexed sources instead. If this keeps happening, try again in a minute."
        )
    else:
        intro = (
            "Here are **short highlights** from the indexed filings and data for this question. "
            "A full narrative summary appears when an assistant is connected to this deployment."
        )

    return (
        f"## {ticker}\n\n"
        f"*{question.strip()}*\n\n"
        f"{intro}\n\n"
        "### Source highlights\n\n"
        + "\n\n".join(lines)
    )
