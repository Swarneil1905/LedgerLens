from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from database.config import database_url
from database.models import Base

_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


def get_engine() -> Engine:
    global _engine, _SessionLocal
    url = database_url()
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    if _engine is None:
        _engine = create_engine(url, pool_pre_ping=True)
        _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False, expire_on_commit=False)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    if _SessionLocal is None:
        get_engine()
    assert _SessionLocal is not None
    return _SessionLocal


def init_schema() -> None:
    """Create tables and supporting indexes (idempotent)."""
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    ddl = text(
        """
        CREATE INDEX IF NOT EXISTS ix_ll_source_chunks_fts
        ON ll_source_chunks USING gin (to_tsvector('english', content));
        """
    )
    with engine.begin() as conn:
        conn.execute(ddl)
