"""Web search ingestion (SerpAPI or Brave). URLs are allowlisted before exposure."""

from __future__ import annotations

import hashlib
import ipaddress
import logging
import os
import re
import socket
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx

from data_sources.http_tools import default_timeout
from schemas.source import SourceResponse, SourceType

logger = logging.getLogger(__name__)


class ConfigError(RuntimeError):
    """Raised when ``WEB_SEARCH_API_KEY`` is required but missing or blank."""


BLOCKED_DOMAINS: frozenset[str] = frozenset(
    {
        "localhost",
        "metadata.google.internal",
        "169.254.169.254",
        "instance-data",
        "169.254.0.0",
    }
)

_SERPAPI_URL = "https://serpapi.com/search"
_BRAVE_URL = "https://api.search.brave.com/res/v1/web/search"


def _sanitize_text(s: str) -> str:
    return s.replace("\x00", "").strip()[:4000]


def _is_safe_url(url: str) -> bool:
    if not url or len(url) > 2048:
        return False
    try:
        parsed = urlparse(url.strip())
    except Exception:
        return False
    if parsed.scheme != "https":
        return False
    host = parsed.hostname
    if not host or not str(host).strip():
        return False
    if "@" in (parsed.netloc or ""):
        return False
    hl = host.lower()
    if hl in BLOCKED_DOMAINS:
        return False

    host_clean = host.strip("[]")
    try:
        addr = ipaddress.ip_address(host_clean)
        if (
            addr.is_private
            or addr.is_loopback
            or addr.is_reserved
            or addr.is_link_local
            or addr.is_multicast
        ):
            return False
        return True
    except ValueError:
        pass

    try:
        infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except OSError:
        return False
    if not infos:
        return False
    for info in infos:
        ip_str = info[4][0]
        try:
            ip = ipaddress.ip_address(ip_str)
        except ValueError:
            continue
        if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
            return False
    return True


def _html_to_plain(html: str) -> str:
    """Strip tags for any snippet that might contain HTML (never store raw HTML)."""
    t = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", html)
    t = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", t)
    t = re.sub(r"(?s)<!--.*?-->", " ", t)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def _parse_published(raw: object | None) -> datetime:
    if raw is None:
        return datetime.now(timezone.utc)
    text = str(raw).strip()
    if not text:
        return datetime.now(timezone.utc)
    try:
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        return datetime.fromisoformat(text)
    except ValueError:
        return datetime.now(timezone.utc)


def _web_result_id(url: str, title: str, published: object | None) -> str:
    base = f"{url}|{title}|{published or ''}"
    return "web-" + hashlib.sha256(base.encode("utf-8")).hexdigest()[:28]


def _detect_provider() -> str:
    raw = os.getenv("WEB_SEARCH_PROVIDER", "").strip().lower()
    if raw in ("serpapi", "brave"):
        return raw
    key = os.getenv("WEB_SEARCH_API_KEY", "").strip()
    if key.upper().startswith("BSA"):
        return "brave"
    return "serpapi"


async def fetch_web_search(query: str, ticker: str) -> list[dict]:
    """
    Run a web search for the ticker-scoped query.

    Returns rows: title, url, snippet, published_date (str | None), provider=\"WEB\".
    """
    key = os.getenv("WEB_SEARCH_API_KEY", "").strip()
    if not key:
        raise ConfigError(
            "WEB_SEARCH_API_KEY is not set or is empty. Set it to your SerpAPI or Brave Search API key."
        )

    tick = ticker.strip().upper()
    if not tick:
        tick = "UNKNOWN"
    safe_query = f"{tick} {query.strip()}".strip()[:200]

    provider = _detect_provider()
    out: list[dict] = []

    try:
        async with httpx.AsyncClient(timeout=default_timeout(), verify=True, trust_env=False) as client:
            if provider == "brave":
                r = await client.get(
                    _BRAVE_URL,
                    headers={"X-Subscription-Token": key, "Accept": "application/json"},
                    params={"q": safe_query, "count": 8},
                )
                r.raise_for_status()
                payload = r.json()
                web = (payload.get("web") or {}) if isinstance(payload, dict) else {}
                results = web.get("results") or []
                if not isinstance(results, list):
                    return []
                for item in results:
                    if not isinstance(item, dict):
                        continue
                    title = _sanitize_text(str(item.get("title") or ""))[:500]
                    url_raw = item.get("url")
                    url = str(url_raw).strip() if url_raw else ""
                    desc = item.get("description") or item.get("snippet") or ""
                    snippet = _sanitize_text(_html_to_plain(str(desc)))[:4000]
                    age = item.get("age") or item.get("published") or item.get("page_age")
                    pub = str(age).strip() if age else None
                    if not title:
                        continue
                    if url and not _is_safe_url(url):
                        url = ""
                    out.append(
                        {
                            "title": title,
                            "url": url or None,
                            "snippet": snippet or title[:4000],
                            "published_date": pub,
                            "provider": "WEB",
                        }
                    )
            else:
                r = await client.get(
                    _SERPAPI_URL,
                    params={
                        "engine": "google",
                        "q": safe_query,
                        "api_key": key,
                        "num": 8,
                    },
                )
                r.raise_for_status()
                payload = r.json()
                organic = payload.get("organic_results") if isinstance(payload, dict) else None
                if not isinstance(organic, list):
                    return []
                for item in organic:
                    if not isinstance(item, dict):
                        continue
                    title = _sanitize_text(str(item.get("title") or ""))[:500]
                    url_raw = item.get("link") or item.get("url")
                    url = str(url_raw).strip() if url_raw else ""
                    desc = item.get("snippet") or item.get("snippet_highlighted_words") or ""
                    if isinstance(desc, list):
                        desc = " ".join(str(x) for x in desc)
                    snippet = _sanitize_text(_html_to_plain(str(desc)))[:4000]
                    pub = item.get("date")
                    pub_s = str(pub).strip() if pub else None
                    if not title:
                        continue
                    if url and not _is_safe_url(url):
                        url = ""
                    out.append(
                        {
                            "title": title,
                            "url": url or None,
                            "snippet": snippet or title[:4000],
                            "published_date": pub_s,
                            "provider": "WEB",
                        }
                    )
    except httpx.RequestError as exc:
        logger.warning("Web search HTTP/transport failed for %s: %s", tick, exc)
        return []
    except Exception as exc:
        logger.warning("Web search failed for %s: %s", tick, exc)
        return []

    return out[:12]


def web_rows_to_source_responses(ticker: str, rows: list[dict]) -> list[SourceResponse]:
    """Map API-neutral dict rows to ``SourceResponse`` for the RAG catalog (ORM path: replace_sources_for_ticker)."""
    upper = ticker.strip().upper()
    out: list[SourceResponse] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        title = _sanitize_text(str(row.get("title") or ""))[:500]
        url = row.get("url")
        url_s = str(url).strip() if url else ""
        if url_s and not _is_safe_url(url_s):
            url_s = ""
        snippet = _sanitize_text(str(row.get("snippet") or ""))[:4000]
        prov = str(row.get("provider") or "WEB")
        pub = row.get("published_date")
        dt = _parse_published(pub)
        rid = _web_result_id(url_s, title, pub)
        engine = _detect_provider()
        meta: dict[str, str | int | float | bool | None] = {"search_engine": engine}
        if isinstance(pub, str) and pub.strip():
            meta["published_hint"] = pub.strip()
        out.append(
            SourceResponse(
                id=rid,
                source_type=SourceType.WEB,
                title=title or "(untitled)",
                provider=prov,
                date=dt,
                url=url_s or None,
                ticker=upper,
                snippet=snippet or title[:4000],
                metadata=meta,
            )
        )
    return out
