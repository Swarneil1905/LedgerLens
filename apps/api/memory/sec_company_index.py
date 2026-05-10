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
# Tighter than generic SEC calls: large JSON; fail fast so proxies (e.g. Railway) do not 502 first requests.
_TICKER_HTTP_TIMEOUT: Final[httpx.Timeout] = httpx.Timeout(25.0, connect=6.0, read=20.0)

_index_lock = asyncio.Lock()
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


async def load_company_index(*, force: bool = False) -> None:
    """Fetch SEC company_tickers.json and build an in-memory search index."""
    global _index, _index_loaded_at, _index_error

    async with _index_lock:
        if _index and not force:
            return

        try:
            async with httpx.AsyncClient(timeout=_TICKER_HTTP_TIMEOUT) as client:
                response = await client.get(_TICKER_JSON_URL, headers=sec_headers())
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
            # Do not cache an empty successful index on failure; allow retries on the next call.
            if force:
                _index = []


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
