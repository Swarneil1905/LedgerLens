from schemas.source import SourceResponse, SourceType


async def fetch_news(ticker: str) -> list[SourceResponse]:
    return [
        SourceResponse(
            id=f"{ticker.lower()}-news-b",
            source_type=SourceType.NEWS,
            title=f"{ticker} news provider B",
            provider="Exa",
            date="2026-04-16T00:00:00Z",
            url=None,
            ticker=ticker,
            snippet="Semantic news connector placeholder.",
            metadata={"provider_slot": "b"},
        )
    ]
