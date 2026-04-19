from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class BookmarkModel:
    id: str
    source_id: str
    created_at: datetime
