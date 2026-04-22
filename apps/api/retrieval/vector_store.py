from database.config import is_database_configured
from database.repository import search_chunks


def search_similar_chunks(query: str, ticker: str) -> list[str]:
    if is_database_configured():
        hits = search_chunks(query, ticker, limit=8)
        if hits:
            return hits
    return [f"Vector result placeholder for {ticker}"]
