from data_sources.refresh_pipeline import gather_company_sources
from memory import persistence
from schemas.source import RefreshSourcesResponse


async def refresh_company_sources(ticker: str) -> RefreshSourcesResponse:
    sources = await gather_company_sources(ticker)
    persistence.replace_company_sources(ticker, sources)
    return RefreshSourcesResponse(status="ok", sources_indexed=len(sources))
