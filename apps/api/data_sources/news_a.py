from __future__ import annotations

import hashlib
import logging
import os
from datetime import datetime, timezone
from typing import Any

import httpx

from data_sources.http_tools import default_timeout
from schemas.source import SourceResponse, SourceType

logger = logging.getLogger(__name__)

_NEWS_EVERYTHING = "https://newsapi.org/v2/everything"


async def fetch_news(client: httpx.AsyncClient, ticker: str) -> list[SourceResponse]:
    key = os.getenv("NEWS_API_KEY", "").strip()
    if not key:
        logger.info("NEWS_API_KEY not set; skipping NewsAPI fetch")
        return []
    upper = ticker.upper()
    try:
        r = await client.get(
            _NEWS_EVERYTHING,
            params={
                "q": upper,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 8,
                "apiKey": key,
            },
            timeout=default_timeout(),
        )
        r.raise_for_status()
        payload: dict[str, Any] = r.json()
        articles = payload.get("articles") or []
        out: list[SourceResponse] = []
        for article in articles:
            if not isinstance(article, dict):
                continue
            title = (article.get("title") or "").strip()
            desc = (article.get("description") or "").strip()
            url = article.get("url")
            published = article.get("publishedAt") or article.get("published_at")
            if not title:
                continue
            snippet = (desc or title)[:300]
            dt = _parse_news_datetime(published)
            aid = _article_id(url, title, published)
            src = article.get("source")
            src_name = src.get("name") if isinstance(src, dict) else None
            out.append(
                SourceResponse(
                    id=aid,
                    source_type=SourceType.NEWS,
                    title=title[:200],
                    provider="NewsAPI",
                    date=dt,
                    url=str(url) if url else None,
                    ticker=upper,
                    snippet=snippet,
                    metadata={"source_name": str(src_name or "NewsAPI")},
                )
            )
        return out
    except httpx.HTTPError as exc:
        logger.warning("NewsAPI fetch failed for %s: %s", upper, exc)
        return []


def _parse_news_datetime(raw: object) -> datetime:
    if raw is None:
        return datetime.now(timezone.utc)
    text = str(raw)
    try:
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        return datetime.fromisoformat(text)
    except ValueError:
        return datetime.now(timezone.utc)


def _article_id(url: object, title: str, published: object) -> str:
    base = f"{url or ''}|{title}|{published or ''}"
    return "news-" + hashlib.sha256(base.encode("utf-8")).hexdigest()[:24]
