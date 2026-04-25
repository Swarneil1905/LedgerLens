from fastapi import APIRouter, Query

from api.refresh_throttle import source_refresh_slot
from data_sources.normalizer import refresh_company_sources
from memory.persistence import get_company_sources
from schemas.source import RefreshSourcesResponse, SourceResponse

router = APIRouter()


@router.post("/refresh", response_model=RefreshSourcesResponse)
async def refresh_sources(ticker: str = Query(min_length=1)) -> RefreshSourcesResponse:
    async with source_refresh_slot(ticker):
        return await refresh_company_sources(ticker)


@router.get("/company/{ticker}", response_model=list[SourceResponse])
async def get_sources(ticker: str) -> list[SourceResponse]:
    return get_company_sources(ticker)
