from database.repository import search_chunks


def search_similar_chunks(
    query: str,
    ticker: str,
    *,
    prefer_periodic_filings: bool = False,
    limit: int = 6,
) -> list[str]:
    """Chunk texts ranked by Postgres FTS, or an empty list when DB is off or there are no hits."""
    return search_chunks(
        query,
        ticker,
        limit=limit,
        prefer_periodic_filings=prefer_periodic_filings,
    )
