from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SourceType(str, Enum):
    FILING = "filing"
    MACRO = "macro"
    NEWS = "news"
    CHART = "chart"


class SourceResponse(BaseModel):
    id: str
    source_type: SourceType
    title: str
    provider: str
    date: datetime
    url: str | None
    ticker: str | None
    # Large enough for indexed filing excerpts (SEC 10-Q/10-K); news/macro stay short at source.
    snippet: str = Field(max_length=50000)
    metadata: dict[str, str | int | float | bool | None]


class BookmarkRequest(BaseModel):
    source_id: str


class BookmarkResponse(BaseModel):
    id: str
    source_id: str
    created_at: datetime
    source: SourceResponse | None = None


class RefreshSourcesResponse(BaseModel):
    status: str
    sources_indexed: int
