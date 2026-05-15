import logging
import os

from fastapi import APIRouter, Query

from api.refresh_throttle import source_refresh_slot
from data_sources.normalizer import refresh_company_sources
from memory.persistence import get_company_sources
from schemas.source import RefreshSourcesResponse, SourceResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/refresh", response_model=RefreshSourcesResponse)
async def refresh_sources(ticker: str = Query(min_length=1)) -> RefreshSourcesResponse:
    if os.getenv("ENABLE_WEB_SEARCH", "false").lower() == "true":
        logger.info(
            "ENABLE_WEB_SEARCH is on; web search runs live on chat queries (not on refresh) for ticker=%s",
            ticker,
        )
    async with source_refresh_slot(ticker):
        return await refresh_company_sources(ticker)


@router.get("/company/{ticker}", response_model=list[SourceResponse])
async def get_sources(ticker: str) -> list[SourceResponse]:
    return get_company_sources(ticker)
