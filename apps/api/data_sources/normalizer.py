from data_sources import fred, news_a, news_b, news_c, sec
from schemas.source import RefreshSourcesResponse, SourceResponse


async def gather_company_sources(ticker: str) -> list[SourceResponse]:
    filing_sources = await sec.fetch_filings(ticker)
    macro_source = await fred.fetch_series("FEDFUNDS", ticker)
    news_sources = [
        *(await news_a.fetch_news(ticker)),
        *(await news_b.fetch_news(ticker)),
        *(await news_c.fetch_news(ticker)),
    ]
    return [*filing_sources, macro_source, *news_sources]


async def refresh_company_sources(ticker: str) -> RefreshSourcesResponse:
    sources = await gather_company_sources(ticker)
    return RefreshSourcesResponse(status="ok", sources_indexed=len(sources))
