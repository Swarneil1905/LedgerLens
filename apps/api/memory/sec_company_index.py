from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Final

import httpx

from data_sources.http_tools import sec_headers
from schemas.workspace import CompanyResponse

logger = logging.getLogger(__name__)

_TICKER_JSON_URL: Final[str] = "https://www.sec.gov/files/company_tickers.json"
# Large JSON; keep bounded so Railway does not 502 while waiting on SEC.
_TICKER_HTTP_TIMEOUT: Final[httpx.Timeout] = httpx.Timeout(22.0, connect=5.0, read=18.0)

# Single-flight SEC fetch: never hold a lock across the HTTP call — concurrent searches
# would otherwise serialize for tens of seconds and each client hits proxy timeouts (502).
_coord_lock = asyncio.Lock()
_load_task: asyncio.Task[None] | None = None
_index: list[CompanyResponse] | None = None
_index_loaded_at: datetime | None = None
_index_error: str | None = None


def _parse_company_tickers_payload(payload: object) -> list[CompanyResponse]:
    """
    SEC publishes `company_tickers.json` as a JSON object keyed by row index:

    {
      "0": {"cik_str": 1045810, "ticker": "NVDA", "title": "NVIDIA CORP"},
      ...
    }
    """

    if not isinstance(payload, dict):
        return []

    out: list[CompanyResponse] = []
    for _, row in payload.items():
        if not isinstance(row, dict):
            continue
        cik_val = row.get("cik_str")
        tick = row.get("ticker")
        name = row.get("title")
        if cik_val is None or tick is None or name is None:
            continue

        ticker = str(tick).strip().upper()
        title = str(name).strip()
        if not ticker or not title:
            continue

        try:
            cik = str(int(cik_val)).zfill(10)
        except (TypeError, ValueError):
            continue

        out.append(
            CompanyResponse(
                id=ticker,
                name=title,
                ticker=ticker,
                sector=f"CIK {cik}",
                market_cap="—",
            )
        )
    return out


async def _fetch_company_index_from_sec(*, force: bool) -> None:
    """Perform one SEC download + parse (no locks held by caller across awaits)."""
    global _index, _index_loaded_at, _index_error

    try:
        # trust_env=False: Railway sometimes injects HTTP(S)_PROXY env vars that break SEC.
        async with httpx.AsyncClient(timeout=_TICKER_HTTP_TIMEOUT, trust_env=False) as client:
            response = await client.get(_TICKER_JSON_URL, headers=sec_headers())
            if response.status_code != 200:
                logger.warning(
                    "SEC company_tickers.json HTTP %s (body prefix: %r)",
                    response.status_code,
                    (response.text or "")[:200],
                )
            response.raise_for_status()
            parsed = _parse_company_tickers_payload(response.json())
            if not parsed:
                raise ValueError("company_tickers.json parsed to zero rows")

            _index = parsed
            _index_loaded_at = datetime.now(timezone.utc)
            _index_error = None
    except Exception as exc:
        _index_error = str(exc)
        logger.warning("SEC company index load failed: %s", exc, exc_info=True)
        if force:
            _index = []


async def load_company_index(*, force: bool = False) -> None:
    """Ensure SEC company_tickers.json is loaded (single in-flight fetch shared by all callers)."""
    global _load_task

    if _index is not None and not force:
        return

    async with _coord_lock:
        if _index is not None and not force:
            return
        if _load_task is None or _load_task.done():
            _load_task = asyncio.create_task(_fetch_company_index_from_sec(force=force))
        wait_on = _load_task

    await wait_on


def company_index_error() -> str | None:
    return _index_error


def company_index_loaded_at() -> datetime | None:
    return _index_loaded_at


def all_companies() -> list[CompanyResponse]:
    return list(_index or [])


def search_companies_sec(query: str, *, limit: int = 25) -> list[CompanyResponse]:
    normalized = query.strip().lower()
    if not normalized:
        return []

    rows = _index or []
    starts: list[CompanyResponse] = []
    contains: list[CompanyResponse] = []

    for company in rows:
        name_l = company.name.lower()
        tick_l = company.ticker.lower()
        if tick_l == normalized or name_l == normalized:
            starts.insert(0, company)
            continue
        if tick_l.startswith(normalized) or name_l.startswith(normalized):
            starts.append(company)
            continue
        if normalized in tick_l or normalized in name_l:
            contains.append(company)

    merged = starts + contains
    deduped: list[CompanyResponse] = []
    seen: set[str] = set()
    for item in merged:
        if item.ticker in seen:
            continue
        seen.add(item.ticker)
        deduped.append(item)
        if len(deduped) >= limit:
            break
    return deduped
