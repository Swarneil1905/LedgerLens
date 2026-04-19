from schemas.source import SourceResponse, SourceType


async def fetch_filings(ticker: str) -> list[SourceResponse]:
    return [
        SourceResponse(
            id=f"{ticker.lower()}-10q",
            source_type=SourceType.FILING,
            title=f"{ticker} latest 10-Q",
            provider="SEC EDGAR",
            date="2026-01-30T00:00:00Z",
            url=None,
            ticker=ticker,
            snippet="Placeholder filing connector response for initial scaffold.",
            metadata={"form_type": "10-Q"},
        )
    ]
