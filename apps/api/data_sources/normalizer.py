import httpx

from data_sources import fred, news_a, news_b, news_c, sec
from data_sources.http_tools import default_timeout
from memory import persistence
from schemas.source import RefreshSourcesResponse, SourceResponse


async def gather_company_sources(ticker: str) -> list[SourceResponse]:
    async with httpx.AsyncClient(timeout=default_timeout()) as client:
        filing_sources = await sec.fetch_filings(client, ticker)
        macro = await fred.fetch_series(client, fred.configured_macro_series_id(), ticker)
        news_sources: list[SourceResponse] = []
        news_sources.extend(await news_a.fetch_news(client, ticker))
        news_sources.extend(await news_b.fetch_news(client, ticker))
        news_sources.extend(await news_c.fetch_news(client, ticker))
        merged: list[SourceResponse] = [*filing_sources]
        if macro is not None:
            merged.append(macro)
        merged.extend(news_sources)
        return merged


async def refresh_company_sources(ticker: str) -> RefreshSourcesResponse:
    sources = await gather_company_sources(ticker)
    persistence.replace_company_sources(ticker, sources)
    return RefreshSourcesResponse(status="ok", sources_indexed=len(sources))
