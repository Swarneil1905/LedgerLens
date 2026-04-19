from pydantic import BaseModel

from retrieval.query import expand_query
from retrieval.reranker import rerank_chunks
from retrieval.vector_store import search_similar_chunks


class RetrievedContext(BaseModel):
    chunks: list[str]
    sources: list[str]
    token_count: int


async def assemble_context(question: str, ticker: str) -> RetrievedContext:
    expansions = expand_query(question)
    retrieved = search_similar_chunks(" ".join(expansions), ticker)
    reranked = rerank_chunks(retrieved)
    return RetrievedContext(chunks=reranked, sources=[ticker], token_count=len(" ".join(reranked).split()))
