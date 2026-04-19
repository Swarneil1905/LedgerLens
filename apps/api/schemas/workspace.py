from datetime import datetime

from pydantic import BaseModel

from schemas.chart import ChartResponse
from schemas.chat import ChatHistoryResponse
from schemas.source import SourceResponse


class CompanyResponse(BaseModel):
    id: str
    name: str
    ticker: str
    sector: str
    market_cap: str


class WorkspaceCreateRequest(BaseModel):
    company_id: str


class WorkspaceSummaryResponse(BaseModel):
    latest_filing_date: str
    last_news_event: str
    macro_context: str


class WorkspaceResponse(BaseModel):
    id: str
    company: CompanyResponse
    summary: WorkspaceSummaryResponse
    recent_activity: list[str]
    chat_messages: list[ChatHistoryResponse]
    sources: list[SourceResponse]
    charts: list[ChartResponse]
    bookmark_count: int
    updated_at: datetime
