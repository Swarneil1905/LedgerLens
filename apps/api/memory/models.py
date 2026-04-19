from dataclasses import dataclass
from datetime import datetime

from schemas.source import SourceResponse


@dataclass(slots=True)
class BookmarkModel:
    id: str
    source_id: str
    created_at: datetime
    source: SourceResponse | None = None
