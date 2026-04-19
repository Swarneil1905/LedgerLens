from datetime import datetime, timedelta

from pydantic import BaseModel


class SessionState(BaseModel):
    session_id: str
    ticker: str | None
    recent_turns: list[str]
    active_source_ids: list[str]
    filters: list[str]
    created_at: datetime
    last_active: datetime


SESSION_TTL = timedelta(hours=2)
SESSION_STORE: dict[str, SessionState] = {}
