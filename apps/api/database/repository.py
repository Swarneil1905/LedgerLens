from __future__ import annotations

import logging
from uuid import uuid4

from sqlalchemy import delete, select, text
from database.config import is_database_configured
from database.models import SourceChunkRow, SourceRow
from database.session import get_session_factory
from retrieval.chunk_split import index_slices_for_source
from schemas.source import SourceResponse

logger = logging.getLogger(__name__)


def replace_sources_for_ticker(ticker: str, sources: list[SourceResponse]) -> None:
    if not is_database_configured():
        return
    upper = ticker.upper()
    factory = get_session_factory()
    payloads = [(s.id, upper, s.model_dump(mode="json")) for s in sources]
    chunks: list[tuple[str, str, str, str]] = []
    for s in sources:
        for slice_text in index_slices_for_source(s):
            chunks.append((str(uuid4()), s.id, upper, slice_text))

    with factory() as session:
        session.execute(delete(SourceChunkRow).where(SourceChunkRow.ticker == upper))
        session.execute(delete(SourceRow).where(SourceRow.ticker == upper))
        for sid, tick, payload in payloads:
            session.add(SourceRow(id=sid, ticker=tick, payload=payload))
        for cid, sid, tick, content in chunks:
            session.add(SourceChunkRow(id=cid, source_id=sid, ticker=tick, content=content))
        session.commit()


def load_sources_for_ticker(ticker: str) -> list[SourceResponse]:
    if not is_database_configured():
        return []
    upper = ticker.upper()
    factory = get_session_factory()
    with factory() as session:
        rows = session.scalars(select(SourceRow).where(SourceRow.ticker == upper)).all()
        out: list[SourceResponse] = []
        for row in rows:
            out.append(SourceResponse.model_validate(row.payload))
        return out


def _fts_safe_query(raw: str) -> str:
    collapsed = " ".join(part for part in raw.replace("/", " ").split() if part.strip())
    safe = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in collapsed)
    words = [w for w in safe.lower().split() if w][:12]
    return " ".join(words) if words else "earnings"


def search_chunks(
    query: str,
    ticker: str,
    limit: int = 8,
    *,
    prefer_periodic_filings: bool = False,
) -> list[str]:
    if not is_database_configured():
        return []
    upper = ticker.upper()
    q = _fts_safe_query(query)
    prefer_flag = 1 if prefer_periodic_filings else 0
    factory = get_session_factory()
    stmt = text(
        """
        SELECT c.content
        FROM ll_source_chunks c
        INNER JOIN ll_sources s ON s.id = c.source_id AND s.ticker = c.ticker
        WHERE c.ticker = :ticker
          AND to_tsvector('english', c.content) @@ plainto_tsquery('english', :q)
          AND (
            :prefer <> 1
            OR COALESCE(s.payload->'metadata'->>'form_type', '') IN ('10-Q', '10-K')
          )
        ORDER BY
          CASE
            WHEN :prefer = 1
              AND COALESCE(s.payload->'metadata'->>'form_type', '') = '10-Q'
            THEN 0
            WHEN :prefer = 1
              AND COALESCE(s.payload->'metadata'->>'form_type', '') = '10-K'
            THEN 1
            ELSE 2
          END,
          ts_rank(
            to_tsvector('english', c.content),
            plainto_tsquery('english', :q)
          ) DESC
        LIMIT :lim
        """
    )
    try:
        with factory() as session:
            result = session.execute(
                stmt, {"ticker": upper, "q": q, "lim": limit, "prefer": prefer_flag}
            )
            rows = [row[0] for row in result.fetchall()]
            if rows:
                return rows
            # Broader fallback: keep ranking favoring 10-Q/10-K even when filing-specific FTS misses.
            fallback = text(
                """
                SELECT c.content
                FROM ll_source_chunks c
                INNER JOIN ll_sources s ON s.id = c.source_id AND s.ticker = c.ticker
                WHERE c.ticker = :ticker
                ORDER BY
                  CASE COALESCE(s.payload->'metadata'->>'form_type', '')
                    WHEN '10-Q' THEN 1
                    WHEN '10-K' THEN 2
                    WHEN '8-K' THEN 3
                    ELSE 4
                  END,
                  c.id DESC
                LIMIT :lim
                """
            )
            result_fb = session.execute(fallback, {"ticker": upper, "lim": limit})
            return [row[0] for row in result_fb.fetchall()]
    except Exception:
        logger.warning("chunk FTS query failed", exc_info=True)
        return []
