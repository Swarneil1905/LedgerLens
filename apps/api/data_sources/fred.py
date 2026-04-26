from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

import httpx

from data_sources.http_tools import default_timeout
from schemas.source import SourceResponse, SourceType

logger = logging.getLogger(__name__)

_FRED_OBS_URL = "https://api.stlouisfed.org/fred/series/observations"


def configured_macro_series_id() -> str:
    """FRED `series_id` for the single macro chip on refresh; default FEDFUNDS."""
    raw = os.getenv("FRED_SERIES_ID", "").strip()
    return raw or "FEDFUNDS"


async def fetch_series(
    client: httpx.AsyncClient, series_id: str, ticker: str | None = None
) -> SourceResponse | None:
    key = os.getenv("FRED_API_KEY", "").strip()
    if not key:
        logger.info("FRED_API_KEY not set; skipping live macro fetch")
        return None
    try:
        r = await client.get(
            _FRED_OBS_URL,
            params={
                "series_id": series_id,
                "api_key": key,
                "file_type": "json",
                "limit": 1,
                "sort_order": "desc",
            },
            timeout=default_timeout(),
        )
        r.raise_for_status()
        try:
            payload = r.json()
        except ValueError as exc:
            logger.warning("FRED JSON parse failed for %s: %s", series_id, exc)
            return None
        if not isinstance(payload, dict):
            return None
        obs = payload.get("observations") or []
        if not obs:
            return None
        latest = obs[0]
        val = latest.get("value")
        date_raw = latest.get("date")
        if val in (".", None) or not date_raw:
            return None
        try:
            obs_date = datetime.strptime(str(date_raw), "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            obs_date = datetime.now(timezone.utc)
        snippet = f"Latest observation {date_raw}: {val} ({series_id})."
        return SourceResponse(
            id=f"fred-{series_id.lower()}-{date_raw}",
            source_type=SourceType.MACRO,
            title=f"FRED {series_id}",
            provider="FRED",
            date=obs_date,
            url=f"https://fred.stlouisfed.org/series/{series_id}",
            ticker=ticker,
            snippet=snippet[:300],
            metadata={"series_id": series_id, "value": str(val)},
        )
    except httpx.HTTPError as exc:
        logger.warning("FRED fetch failed for %s: %s", series_id, exc)
        return None
    except (KeyError, TypeError) as exc:
        logger.warning("FRED payload shape unexpected for %s: %s", series_id, exc)
        return None
