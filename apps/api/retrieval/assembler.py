from datetime import datetime, timezone

from pydantic import BaseModel

from memory.persistence import get_company_sources
from retrieval.query import expand_query, question_prefers_periodic_filings
from retrieval.reranker import rerank_chunks
from retrieval.vector_store import search_similar_chunks
from schemas.source import SourceResponse, SourceType


class RetrievedContext(BaseModel):
    chunks: list[str]
    sources: list[SourceResponse]
    token_count: int


async def assemble_context(question: str, ticker: str) -> RetrievedContext:
    expansions = expand_query(question)
    retrieved = search_similar_chunks(
        " ".join(expansions),
        ticker,
        prefer_periodic_filings=question_prefers_periodic_filings(question),
    )
    reranked = rerank_chunks(retrieved)
    catalog = get_company_sources(ticker)
    merged_sources = _merge_sources(catalog, reranked, ticker)
    token_estimate = len(" ".join(reranked).split()) + sum(len(s.snippet.split()) for s in merged_sources)
    return RetrievedContext(chunks=reranked, sources=merged_sources, token_count=token_estimate)


def _merge_sources(catalog: list[SourceResponse], chunks: list[str], ticker: str) -> list[SourceResponse]:
    if catalog:
        return catalog[:8]
    # No catalog rows: only surface a synthetic "source" when we actually have chunk text.
    # Otherwise return [] so the UI does not show "1 sources linked" for an empty index (e.g. JPM never refreshed).
    if not chunks:
        return []
    fallback_snippet = chunks[0][:300]
    return [
        SourceResponse(
            id=f"{ticker.lower()}-fallback",
            source_type=SourceType.FILING,
            title=f"{ticker.upper()} evidence (fallback)",
            provider="LedgerLens",
            date=datetime.now(timezone.utc),
            url=None,
            ticker=ticker.upper(),
            snippet=fallback_snippet,
            metadata={"mode": "fallback"},
        )
    ]
