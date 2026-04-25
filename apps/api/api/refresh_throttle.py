from __future__ import annotations

import asyncio
import os
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import HTTPException

_lock = asyncio.Lock()
_last_complete_monotonic: dict[str, float] = {}
_in_flight: set[str] = set()


def _cooldown_seconds() -> float:
    raw = os.getenv("SOURCES_REFRESH_MIN_INTERVAL_SECONDS", "").strip()
    if raw:
        try:
            return max(0.0, float(raw))
        except ValueError:
            return 0.0
    env = (os.getenv("ENVIRONMENT") or os.getenv("ENV") or "").strip().lower()
    if env in ("production", "prod"):
        return 120.0
    return 0.0


@asynccontextmanager
async def source_refresh_slot(ticker: str) -> AsyncIterator[None]:
    """Enforce per-ticker cooldown and single in-flight refresh when cooldown is enabled."""
    upper = ticker.strip().upper()
    if not upper:
        raise HTTPException(status_code=400, detail="ticker is required")

    cooldown = _cooldown_seconds()
    if cooldown <= 0:
        yield
        return

    now = time.monotonic()
    async with _lock:
        if upper in _in_flight:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "refresh_in_progress",
                    "message": f"A refresh is already running for {upper}.",
                },
                headers={"Retry-After": "5"},
            )
        last = _last_complete_monotonic.get(upper, 0.0)
        elapsed = now - last
        if last > 0.0 and elapsed < cooldown:
            retry_after = max(1, int(cooldown - elapsed) + 1)
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "refresh_rate_limited",
                    "message": (
                        f"Refresh for {upper} is limited to once every {int(cooldown)} seconds. "
                        "Try again later, or set SOURCES_REFRESH_MIN_INTERVAL_SECONDS=0 to disable this limit."
                    ),
                    "retry_after_seconds": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )
        _in_flight.add(upper)

    try:
        yield
    except Exception:
        async with _lock:
            _in_flight.discard(upper)
        raise
    else:
        async with _lock:
            _in_flight.discard(upper)
            _last_complete_monotonic[upper] = time.monotonic()
