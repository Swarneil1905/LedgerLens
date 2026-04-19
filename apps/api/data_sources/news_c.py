from schemas.source import SourceResponse, SourceType


async def fetch_news(ticker: str) -> list[SourceResponse]:
    return [
        SourceResponse(
            id=f"{ticker.lower()}-news-c",
            source_type=SourceType.NEWS,
            title=f"{ticker} news provider C",
            provider="GDELT",
            date="2026-04-15T00:00:00Z",
            url=None,
            ticker=ticker,
            snippet="Fallback open-web news connector placeholder.",
            metadata={"provider_slot": "c"},
        )
    ]
