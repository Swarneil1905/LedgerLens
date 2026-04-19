from datetime import datetime

from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    question: str = Field(min_length=3)
    ticker: str = Field(min_length=1)
    session_id: str = Field(min_length=1)
    source_filters: list[str]


class ChatHistoryResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
