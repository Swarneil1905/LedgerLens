import os

import httpx


def sec_headers() -> dict[str, str]:
    ua = os.getenv("SEC_HTTP_USER_AGENT", "").strip()
    if not ua:
        ua = "LedgerLens/1.0 (research tooling; contact: support@ledgerlens.app)"
    return {"User-Agent": ua, "Accept-Encoding": "gzip, deflate"}


def default_timeout() -> httpx.Timeout:
    return httpx.Timeout(30.0, connect=10.0)
