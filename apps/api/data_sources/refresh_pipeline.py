"""Parallel source refresh (SEC, FRED, news, optional web). Used by ``normalizer.refresh_company_sources``."""

from __future__ import annotations

import asyncio
import logging
import os

import httpx

from data_sources import fred, news_a, news_b, news_c, sec
from data_sources.http_tools import default_timeout
from data_sources.web_search import ConfigError, fetch_web_search, web_rows_to_source_responses
from schemas.source import SourceResponse

logger = logging.getLogger(__name__)


async def gather_company_sources(ticker: str) -> list[SourceResponse]:
    async with httpx.AsyncClient(timeout=default_timeout(), verify=True, trust_env=False) as client:

        async def _web_branch() -> list[SourceResponse]:
            if os.getenv("ENABLE_WEB_SEARCH", "false").lower() != "true":
                logger.info("ENABLE_WEB_SEARCH is not true; skipping web search ingest")
                return []
            try:
                rows = await fetch_web_search("", ticker)
            except ConfigError as exc:
                logger.warning("%s — skipping web ingest for this refresh.", exc)
                return []
            return web_rows_to_source_responses(ticker, rows)

        filing_sources, macro, news_a_r, news_b_r, news_c_r, web_sources = await asyncio.gather(
            sec.fetch_filings(client, ticker),
            fred.fetch_series(client, fred.configured_macro_series_id(), ticker),
            news_a.fetch_news(client, ticker),
            news_b.fetch_news(client, ticker),
            news_c.fetch_news(client, ticker),
            _web_branch(),
        )

    merged: list[SourceResponse] = [*filing_sources]
    if macro is not None:
        merged.append(macro)
    merged.extend(news_a_r)
    merged.extend(news_b_r)
    merged.extend(news_c_r)
    merged.extend(web_sources)
    return merged
