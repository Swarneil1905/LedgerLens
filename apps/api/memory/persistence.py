from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import uuid4

from schemas.chart import ChartPointResponse, ChartResponse, ChartSeriesResponse
from schemas.chat import ChatHistoryResponse
from schemas.source import BookmarkResponse, SourceResponse, SourceType
from schemas.workspace import CompanyResponse, WorkspaceResponse, WorkspaceSummaryResponse

from database.config import is_database_configured
from database.repository import load_sources_for_ticker, replace_sources_for_ticker
from memory.models import BookmarkModel
from memory.sec_company_index import all_companies, load_company_index

logger = logging.getLogger(__name__)

_LEGACY_SLUG_TO_TICKER: dict[str, str] = {
    "apple": "AAPL",
    "microsoft": "MSFT",
}

_DEMO_COMPANIES: list[CompanyResponse] = [
    CompanyResponse(
        id="AAPL",
        name="Apple Inc.",
        ticker="AAPL",
        sector="Technology Hardware",
        market_cap="$2.7T",
    ),
    CompanyResponse(
        id="MSFT",
        name="Microsoft",
        ticker="MSFT",
        sector="Software",
        market_cap="$3.1T",
    ),
]

_default_sources: dict[str, list[SourceResponse]] = {
    "AAPL": [
        SourceResponse(
            id="source-aapl-filing",
            source_type=SourceType.FILING,
            title="Apple Q1 2026 10-Q",
            provider="SEC EDGAR",
            date=datetime(2026, 1, 30, tzinfo=timezone.utc),
            url=None,
            ticker="AAPL",
            snippet="Management reiterated services strength and FX pressure.",
            metadata={"form_type": "10-Q"},
        ),
        SourceResponse(
            id="source-aapl-news",
            source_type=SourceType.NEWS,
            title="Apple suppliers point to steadier demand",
            provider="Reuters",
            date=datetime(2026, 4, 17, tzinfo=timezone.utc),
            url=None,
            ticker="AAPL",
            snippet="Supplier checks suggest tighter inventory and stable premium demand.",
            metadata={"region": "Global"},
        ),
        SourceResponse(
            id="source-aapl-macro",
            source_type=SourceType.MACRO,
            title="Federal Funds Effective Rate",
            provider="FRED",
            date=datetime(2026, 4, 1, tzinfo=timezone.utc),
            url=None,
            ticker=None,
            snippet="Policy rate remains restrictive versus pre-2022 levels.",
            metadata={"series_id": "FEDFUNDS"},
        ),
    ],
    "MSFT": [
        SourceResponse(
            id="source-msft-filing",
            source_type=SourceType.FILING,
            title="Microsoft latest 10-Q",
            provider="SEC EDGAR",
            date=datetime(2026, 1, 28, tzinfo=timezone.utc),
            url=None,
            ticker="MSFT",
            snippet="Azure growth commentary and enterprise demand signals.",
            metadata={"form_type": "10-Q"},
        ),
        SourceResponse(
            id="source-msft-news",
            source_type=SourceType.NEWS,
            title="Microsoft news provider A",
            provider="NewsAPI",
            date=datetime(2026, 4, 16, tzinfo=timezone.utc),
            url=None,
            ticker="MSFT",
            snippet="Primary news connector placeholder.",
            metadata={"provider_slot": "a"},
        ),
    ],
}

_sources_by_ticker: dict[str, list[SourceResponse]] = {
    k: list(v) for k, v in _default_sources.items()
}

_chart_template = ChartResponse(
    id="chart-services-mix",
    title="Services mix stability",
    subtitle="Normalized internal view for workspace charting.",
    series=[
        ChartSeriesResponse(
            id="services",
            label="Services %",
            color="var(--ll-accent)",
            points=[
                ChartPointResponse(label="Q2", value=28),
                ChartPointResponse(label="Q3", value=29),
                ChartPointResponse(label="Q4", value=30),
                ChartPointResponse(label="Q1", value=31),
            ],
        )
    ],
)

_session_messages: dict[str, list[ChatHistoryResponse]] = {}

_bookmarks: list[BookmarkModel] = []


def _resolve_workspace_key(raw: str) -> str:
    slug = raw.strip().lower()
    return _LEGACY_SLUG_TO_TICKER.get(slug, raw.strip().upper())


def _find_company(ticker: str) -> CompanyResponse | None:
    upper = ticker.strip().upper()
    if not upper:
        return None
    for company in all_companies():
        if company.ticker == upper:
            return company
    return None


def _synthetic_company(ticker: str) -> CompanyResponse:
    upper = ticker.strip().upper()
    return CompanyResponse(
        id=upper,
        name=upper,
        ticker=upper,
        sector="Public company",
        market_cap="—",
    )


async def list_workspaces() -> list[WorkspaceResponse]:
    # Intentionally lightweight: the full SEC universe is accessed via `/companies/search`.
    return [_build_workspace(company) for company in _DEMO_COMPANIES]


async def create_workspace(company_id: str) -> WorkspaceResponse | None:
    await load_company_index()
    ticker = _resolve_workspace_key(company_id)
    if not ticker:
        return None

    company = _find_company(ticker)
    if company is None:
        return None
    return _build_workspace(company)


async def get_workspace(workspace_id: str) -> WorkspaceResponse | None:
    await load_company_index()
    ticker = _resolve_workspace_key(workspace_id)
    if not ticker:
        return None

    company = _find_company(ticker)
    if company is None:
        return None
    return _build_workspace(company)


def replace_company_sources(ticker: str, sources: list[SourceResponse]) -> None:
    upper = ticker.upper()
    _sources_by_ticker[upper] = list(sources)
    try:
        replace_sources_for_ticker(upper, sources)
    except Exception:
        logger.exception("Postgres source persist failed for %s; in-memory cache still updated", upper)


def get_chat_history(session_id: str) -> list[ChatHistoryResponse]:
    return list(_session_messages.get(session_id, []))


def append_chat_message(
    session_id: str,
    *,
    role: str,
    content: str,
    follow_ups: list[str] | None = None,
    sources: list[SourceResponse] | None = None,
) -> ChatHistoryResponse:
    message = ChatHistoryResponse(
        id=str(uuid4()),
        role=role,
        content=content,
        created_at=datetime.now(timezone.utc),
        follow_ups=follow_ups,
        sources=(sources if role == "assistant" else None),
    )
    _session_messages.setdefault(session_id, []).append(message)
    return message


def add_bookmark(source_id: str) -> BookmarkResponse:
    source = _find_source(source_id)
    bookmark = BookmarkModel(
        id=str(uuid4()),
        source_id=source_id,
        created_at=datetime.now(timezone.utc),
        source=source,
    )
    _bookmarks.append(bookmark)
    return _bookmark_to_response(bookmark)


def remove_bookmark(bookmark_id: str) -> bool:
    global _bookmarks
    original = len(_bookmarks)
    _bookmarks = [item for item in _bookmarks if item.id != bookmark_id]
    return len(_bookmarks) < original


def list_bookmarks() -> list[BookmarkResponse]:
    return [_bookmark_to_response(item) for item in _bookmarks]


def get_company_sources(ticker: str) -> list[SourceResponse]:
    upper = ticker.upper()
    if is_database_configured():
        try:
            db_rows = load_sources_for_ticker(upper)
            if db_rows:
                return db_rows
        except Exception:
            logger.exception(
                "Postgres source load failed for %s; falling back to in-memory cache",
                upper,
            )
    if upper in _sources_by_ticker:
        return list(_sources_by_ticker[upper])
    return []


def list_workspace_charts(_: str) -> list[ChartResponse]:
    return [_chart_template]


def _bookmark_to_response(model: BookmarkModel) -> BookmarkResponse:
    return BookmarkResponse(
        id=model.id,
        source_id=model.source_id,
        created_at=model.created_at,
        source=model.source,
    )


def _bookmark_count_for_ticker(ticker: str) -> int:
    upper = ticker.upper()
    total = 0
    for bookmark in _bookmarks:
        if bookmark.source is None:
            continue
        if bookmark.source.ticker and bookmark.source.ticker.upper() == upper:
            total += 1
    return total


def _find_source(source_id: str) -> SourceResponse | None:
    for items in _sources_by_ticker.values():
        for item in items:
            if item.id == source_id:
                return item
    return None


def _build_workspace(company: CompanyResponse) -> WorkspaceResponse:
    sources = get_company_sources(company.ticker)
    return WorkspaceResponse(
        id=company.id,
        company=company,
        summary=WorkspaceSummaryResponse(
            latest_filing_date="2026-01-30",
            last_news_event="Supplier commentary updated 2 days ago",
            macro_context="Rates remain restrictive while consumer demand stays resilient.",
        ),
        recent_activity=[
            "Compared filing language quarter over quarter.",
            "Bookmarked supply-chain evidence.",
            "Reviewed macro context against demand.",
        ],
        chat_messages=[],
        sources=sources,
        charts=list_workspace_charts(company.ticker),
        bookmark_count=_bookmark_count_for_ticker(company.ticker),
        updated_at=datetime.now(timezone.utc),
    )
