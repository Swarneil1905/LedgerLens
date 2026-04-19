from schemas.source import SourceResponse, SourceType


async def fetch_news(ticker: str) -> list[SourceResponse]:
    return [
        SourceResponse(
            id=f"{ticker.lower()}-news-a",
            source_type=SourceType.NEWS,
            title=f"{ticker} news provider A",
            provider="NewsAPI",
            date="2026-04-17T00:00:00Z",
            url=None,
            ticker=ticker,
            snippet="Primary news connector placeholder.",
            metadata={"provider_slot": "a"},
        )
    ]
