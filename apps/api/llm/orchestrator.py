import asyncio
from collections.abc import AsyncGenerator

from llm.streaming import format_sse
from memory.persistence import append_chat_message, list_workspace_charts
from retrieval.assembler import assemble_context
from schemas.chat import ChatQueryRequest
from schemas.source import SourceResponse


async def generate_grounded_answer(request: ChatQueryRequest) -> AsyncGenerator[str, None]:
    context = await assemble_context(request.question, request.ticker)
    sources = _filter_sources(context.sources, request.source_filters)
    answer, followups = _compose_answer(request.question, request.ticker, sources)

    append_chat_message(request.session_id, role="user", content=request.question)

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


def _compose_answer(question: str, ticker: str, sources: list[SourceResponse]) -> tuple[str, list[str]]:
    if not sources:
        copy = (
            f"No indexed sources were available for {ticker}. "
            f"Run POST /sources/refresh?ticker={ticker} and retry. Original question: {question}"
        )
        followups = [
            f"Refresh sources for {ticker}?",
            "Try a different ticker with existing coverage?",
            "Narrow the question to a single filing topic?",
        ]
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
    followups = [
        "Which filing section changed most versus the prior quarter?",
        "Which macro series is most correlated with demand in this narrative?",
        "Which headline most challenges the tone implied by the filing excerpts?",
    ]
    return narrative, followups
