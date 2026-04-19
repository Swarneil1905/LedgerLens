from schemas.source import SourceResponse, SourceType


async def fetch_series(series_id: str, ticker: str | None = None) -> SourceResponse:
    return SourceResponse(
        id=f"fred-{series_id.lower()}",
        source_type=SourceType.MACRO,
        title=f"FRED series {series_id}",
        provider="FRED",
        date="2026-04-01T00:00:00Z",
        url=None,
        ticker=ticker,
        snippet="Macro series scaffold for local development and UI integration.",
        metadata={"series_id": series_id},
    )
