import asyncio
import logging
from collections.abc import AsyncGenerator

from llm.config import get_llm_settings
from llm.ollama import stream_ollama_chat
from llm.prompts import SYSTEM_PROMPT, build_answer_prompt
from llm.streaming import format_sse
from memory.persistence import append_chat_message, list_workspace_charts
from retrieval.assembler import RetrievedContext, assemble_context
from schemas.chat import ChatQueryRequest
from schemas.source import SourceResponse

logger = logging.getLogger(__name__)


async def generate_grounded_answer(request: ChatQueryRequest) -> AsyncGenerator[str, None]:
    context = await assemble_context(request.question, request.ticker)
    sources = _filter_sources(context.sources, request.source_filters)

    append_chat_message(request.session_id, role="user", content=request.question)

    settings = get_llm_settings()
    answer: str
    followups: list[str]

    if settings.provider == "ollama" and sources:
        parts: list[str] = []
        try:
            context_block = _format_rag_context(context)
            user_prompt = build_answer_prompt(
                request.ticker, request.question, context_block
            )
            async for delta in stream_ollama_chat(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                system_prompt=SYSTEM_PROMPT.strip(),
                user_prompt=user_prompt,
            ):
                parts.append(delta)
                yield format_sse("text", {"chunk": delta})
            answer = "".join(parts)
            followups = _followup_suggestions(request.ticker, sources)
        except Exception:
            logger.exception("Ollama chat failed; using template answer")
            answer, followups = _compose_answer(request.question, request.ticker, sources)
            for token in answer.split(" "):
                yield format_sse("text", {"chunk": f"{token} "})
                await asyncio.sleep(0.008)
    else:
        answer, followups = _compose_answer(request.question, request.ticker, sources)
        for token in answer.split(" "):
            yield format_sse("text", {"chunk": f"{token} "})
            await asyncio.sleep(0.008)

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


def _followup_suggestions(ticker: str, sources: list[SourceResponse]) -> list[str]:
    if not sources:
        return [
            f"Refresh sources for {ticker}?",
            "Try a different ticker with existing coverage?",
            "Narrow the question to a single filing topic?",
        ]
    return [
        "Which filing section changed most versus the prior quarter?",
        "Which macro series is most correlated with demand in this narrative?",
        "Which headline most challenges the tone implied by the filing excerpts?",
    ]


def _format_rag_context(context: RetrievedContext) -> str:
    parts: list[str] = []
    if context.chunks:
        joined = "\n---\n".join(context.chunks[:12])
        parts.append(f"## Retrieved excerpts\n{joined}")
    if context.sources:
        lines: list[str] = []
        for idx, source in enumerate(context.sources[:8], start=1):
            snippet = source.snippet.strip()
            if len(snippet) > 800:
                snippet = f"{snippet[:800]}…"
            lines.append(
                f"[{idx}] {source.provider} ({source.source_type.value}): {snippet}"
            )
        parts.append("## Source index\n" + "\n".join(lines))
    return "\n\n".join(parts) if parts else "(No context available.)"


def _compose_answer(question: str, ticker: str, sources: list[SourceResponse]) -> tuple[str, list[str]]:
    followups = _followup_suggestions(ticker, sources)
    if not sources:
        copy = (
            f"No indexed sources were available for {ticker}. "
            f"Run POST /sources/refresh?ticker={ticker} and retry. Original question: {question}"
        )
        return copy, followups

    lines: list[str] = []
    for idx, source in enumerate(sources[:5], start=1):
        lines.append(f"[{idx}] {source.provider} ({source.source_type.value}): {source.snippet.strip()}")

    narrative = (
        f"For {ticker}, addressing: {question.strip()}. "
        f"The indexed evidence spans filings, macro, and news where available. "
        f"{' '.join(lines)} "
        "Synthesis stays inside the supplied snippets; where the corpus is thin, widen ingestion before drawing firm conclusions."
    )
    return narrative, followups
