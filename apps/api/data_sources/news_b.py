import httpx

from schemas.source import SourceResponse


async def fetch_news(_client: httpx.AsyncClient, _ticker: str) -> list[SourceResponse]:
    """Reserved for a second wire (e.g. paid terminal). NewsAPI results live in `news_a`."""
    return []
