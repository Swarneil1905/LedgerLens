"""Parallel source refresh (SEC, FRED, news). Used by ``normalizer.refresh_company_sources``."""

from __future__ import annotations

import asyncio
import logging

import httpx

from data_sources import fred, news_a, news_b, news_c, sec
from data_sources.http_tools import default_timeout
from schemas.source import SourceResponse

logger = logging.getLogger(__name__)


async def gather_company_sources(ticker: str) -> list[SourceResponse]:
    async with httpx.AsyncClient(timeout=default_timeout(), verify=True, trust_env=False) as client:
        filing_sources, macro, news_a_r, news_b_r, news_c_r = await asyncio.gather(
            sec.fetch_filings(client, ticker),
            fred.fetch_series(client, fred.configured_macro_series_id(), ticker),
            news_a.fetch_news(client, ticker),
            news_b.fetch_news(client, ticker),
            news_c.fetch_news(client, ticker),
        )

    merged: list[SourceResponse] = [*filing_sources]
    if macro is not None:
        merged.append(macro)
    merged.extend(news_a_r)
    merged.extend(news_b_r)
    merged.extend(news_c_r)
    return merged
