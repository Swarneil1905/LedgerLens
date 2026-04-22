from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class SourceRow(Base):
    """One row per ingested evidence card (matches API SourceResponse shape in JSON)."""

    __tablename__ = "ll_sources"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    ticker: Mapped[str] = mapped_column(String(32), index=True)
    payload: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SourceChunkRow(Base):
    """Searchable text slices for Postgres full-text retrieval."""

    __tablename__ = "ll_source_chunks"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    source_id: Mapped[str] = mapped_column(String(128), index=True)
    ticker: Mapped[str] = mapped_column(String(32), index=True)
    content: Mapped[str] = mapped_column(Text())
