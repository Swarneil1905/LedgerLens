import httpx

from schemas.source import SourceResponse


async def fetch_news(_client: httpx.AsyncClient, _ticker: str) -> list[SourceResponse]:
    """Reserved for open-web or archival feeds; keep a single live path first."""
    return []
