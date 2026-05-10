import asyncio
import logging
from collections.abc import AsyncGenerator

from llm.config import get_llm_settings
from llm.followups import (
    FOLLOWUP_SYSTEM,
    build_followup_user_message,
    parse_followup_json,
    template_followups,
)
from llm.ollama import complete_ollama_chat, stream_ollama_chat
from llm.context_cleanup import focus_excerpt_on_question, scrub_excerpt_text
from llm.prompts import SYSTEM_PROMPT, build_answer_prompt, build_ollama_message_list
from llm.streaming import format_sse
from memory.persistence import append_chat_message, get_chat_history, list_workspace_charts
from retrieval.assembler import RetrievedContext, assemble_context
from schemas.chat import ChatQueryRequest
from schemas.source import SourceResponse

logger = logging.getLogger(__name__)


async def generate_grounded_answer(request: ChatQueryRequest) -> AsyncGenerator[str, None]:
    prior_messages = get_chat_history(request.session_id)
    context = await assemble_context(request.question, request.ticker)
    sources = _filter_sources(context.sources, request.source_filters)
    append_chat_message(request.session_id, role="user", content=request.question)

    settings = get_llm_settings()
    will_use_ollama = settings.provider == "ollama" and bool(sources)
    meta_payload: dict[str, str | None] = {
        "envLlmProvider": settings.provider,
        "answerStream": "ollama" if will_use_ollama else "template",
    }
    if settings.provider == "ollama":
        meta_payload["ollamaModel"] = settings.ollama_model
    yield format_sse("meta", meta_payload)

    answer: str
    followups: list[str]

    if settings.provider == "ollama" and sources:
        parts: list[str] = []
        try:
            logger.info(
                "chat: streaming via Ollama base_url=%s model=%s ticker=%s",
                settings.ollama_base_url,
                settings.ollama_model,
                request.ticker,
            )
            context_block = _format_rag_context(context, request.question)
            user_prompt = build_answer_prompt(
                request.ticker, request.question, context_block
            )
            ollama_messages = build_ollama_message_list(
                system_prompt=SYSTEM_PROMPT.strip(),
                prior_turns=prior_messages,
                current_user_content=user_prompt,
            )
            async for delta in stream_ollama_chat(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                messages=ollama_messages,
            ):
                parts.append(delta)
                yield format_sse("text", {"chunk": delta})
            answer = "".join(parts)
            followups = await _resolve_follow_ups(settings, request, sources, answer)
        except Exception:
            logger.exception("Ollama chat failed; using template answer")
            answer = _compose_answer(request.question, request.ticker, sources)
            for token in answer.split(" "):
                yield format_sse("text", {"chunk": f"{token} "})
                await asyncio.sleep(0.008)
            followups = await _resolve_follow_ups(settings, request, sources, answer)
    else:
        answer = _compose_answer(request.question, request.ticker, sources)
        for token in answer.split(" "):
            yield format_sse("text", {"chunk": f"{token} "})
            await asyncio.sleep(0.008)
        followups = await _resolve_follow_ups(settings, request, sources, answer)

    yield format_sse("sources", {"sources": [source.model_dump(mode="json") for source in sources]})
    yield format_sse("followups", {"followUps": followups})

    charts = list_workspace_charts(request.ticker)
    if charts:
        yield format_sse("chart", {"charts": [charts[0].model_dump(mode="json")]})

    append_chat_message(request.session_id, role="assistant", content=answer, follow_ups=followups)
    yield format_sse("done", {"status": "complete"})


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
    if settings.provider == "ollama" and len(trimmed) > 50:
        try:
            raw = await complete_ollama_chat(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                system_prompt=FOLLOWUP_SYSTEM.strip(),
                user_prompt=build_followup_user_message(
                    ticker=request.ticker,
                    question=request.question,
                    answer=trimmed,
                    indexed_source_lines=_source_title_lines(sources),
                ),
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


def _format_rag_context(context: RetrievedContext, question: str) -> str:
    parts: list[str] = []
    chunks = list(context.chunks[:12])
    if not chunks and context.sources:
        chunks = _source_fallback_chunks(context.sources)
    if chunks:
        polished = [focus_excerpt_on_question(scrub_excerpt_text(c), question) for c in chunks]
        joined = "\n---\n".join(polished)
        parts.append(f"## Retrieved excerpts\n{joined}")
    if context.sources:
        lines: list[str] = []
        for idx, source in enumerate(context.sources[:8], start=1):
            snippet = scrub_excerpt_text(source.snippet.strip())
            if len(snippet) > 8000:
                snippet = focus_excerpt_on_question(snippet, question, max_chars=6000)
            elif len(snippet) > 6000:
                snippet = f"{snippet[:6000]}…"
            lines.append(
                f"[{idx}] {source.provider} ({source.source_type.value}): {snippet}"
            )
        parts.append("## Source index\n" + "\n".join(lines))
    return "\n\n".join(parts) if parts else "(No context available.)"


_TEMPLATE_SNIPPET_CHARS = 1400


def _compose_answer(question: str, ticker: str, sources: list[SourceResponse]) -> str:
    if not sources:
        return (
            f"No indexed sources were available for {ticker}. "
            f"Run POST /sources/refresh?ticker={ticker} and retry. Original question: {question}"
        )

    lines: list[str] = []
    for idx, source in enumerate(sources[:5], start=1):
        snip = scrub_excerpt_text(source.snippet.strip())
        if len(snip) > _TEMPLATE_SNIPPET_CHARS:
            snip = f"{snip[:_TEMPLATE_SNIPPET_CHARS]}…"
        lines.append(
            f"- **[{idx}]** {source.provider} ({source.source_type.value}): {snip}"
        )

    return (
        f"## {ticker}\n\n"
        f"*{question.strip()}*\n\n"
        "This deployment is answering in **template mode** (no LLM): excerpts only. "
        "Set **`LLM_PROVIDER=ollama`** and a reachable **`OLLAMA_*`** on the API host for synthesized answers.\n\n"
        + "\n".join(lines)
    )
