from datetime import UTC, datetime

from schemas.chart import ChartPointResponse, ChartResponse, ChartSeriesResponse
from schemas.chat import ChatHistoryResponse
from schemas.source import BookmarkResponse, SourceResponse, SourceType
from schemas.workspace import CompanyResponse, WorkspaceResponse, WorkspaceSummaryResponse

from memory.models import BookmarkModel

_companies = [
    CompanyResponse(
        id="apple",
        name="Apple Inc.",
        ticker="AAPL",
        sector="Technology Hardware",
        market_cap="$2.7T",
    ),
    CompanyResponse(
        id="microsoft",
        name="Microsoft",
        ticker="MSFT",
        sector="Software",
        market_cap="$3.1T",
    ),
]

_sources = [
    SourceResponse(
        id="source-1",
        source_type=SourceType.FILING,
        title="Apple Q1 2026 10-Q",
        provider="SEC EDGAR",
        date="2026-01-30T00:00:00Z",
        url=None,
        ticker="AAPL",
        snippet="Management reiterated services strength and FX pressure.",
        metadata={"form_type": "10-Q"},
    ),
    SourceResponse(
        id="source-2",
        source_type=SourceType.NEWS,
        title="Apple suppliers point to steadier demand",
        provider="Reuters",
        date="2026-04-17T00:00:00Z",
        url=None,
        ticker="AAPL",
        snippet="Supplier checks suggest tighter inventory and stable premium demand.",
        metadata={"region": "Global"},
    ),
]

_chat_history = [
    ChatHistoryResponse(
        id="msg-1",
        role="user",
        content="What changed in Apple's latest filing?",
        created_at="2026-04-19T08:00:00Z",
    ),
    ChatHistoryResponse(
        id="msg-2",
        role="assistant",
        content="Services commentary improved while FX language became more cautious.",
        created_at="2026-04-19T08:00:10Z",
    ),
]

_chart = ChartResponse(
    id="chart-1",
    title="Services Mix Stability",
    subtitle="Illustrative scaffold data for the first workspace slice.",
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

_bookmarks: list[BookmarkModel] = []


def search_companies(query: str) -> list[CompanyResponse]:
    normalized = query.lower()
    return [company for company in _companies if normalized in company.name.lower() or normalized in company.ticker.lower()]


def create_workspace(company_id: str) -> WorkspaceResponse:
    company = next(item for item in _companies if item.id == company_id)
    return _build_workspace(company)


def get_workspace(workspace_id: str) -> WorkspaceResponse | None:
    company = next((item for item in _companies if item.id == workspace_id), None)
    if company is None:
        return None
    return _build_workspace(company)


def get_chat_history(_: str) -> list[ChatHistoryResponse]:
    return _chat_history


def add_bookmark(source_id: str) -> BookmarkResponse:
    bookmark = BookmarkModel(
        id=f"bookmark-{len(_bookmarks) + 1}",
        source_id=source_id,
        created_at=datetime.now(UTC),
    )
    _bookmarks.append(bookmark)
    return BookmarkResponse.model_validate(bookmark.__dict__)


def list_bookmarks() -> list[BookmarkResponse]:
    return [BookmarkResponse.model_validate(item.__dict__) for item in _bookmarks]


def get_company_sources(ticker: str) -> list[SourceResponse]:
    return [source for source in _sources if source.ticker == ticker]


def _build_workspace(company: CompanyResponse) -> WorkspaceResponse:
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
        chat_messages=_chat_history,
        sources=_sources,
        charts=[_chart],
        bookmark_count=len(_bookmarks),
        updated_at=datetime.now(UTC),
    )
