from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ChatQueryRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    question: str = Field(min_length=3)
    ticker: str = Field(min_length=1)
    session_id: str = Field(min_length=1)
    source_filters: list[str] = Field(default_factory=list)


class ChatHistoryResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
    follow_ups: list[str] | None = None
