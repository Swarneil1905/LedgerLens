from fastapi import APIRouter

from charts.transformer import get_company_charts
from schemas.chart import ChartResponse

router = APIRouter()


@router.get("/company/{ticker}", response_model=list[ChartResponse])
async def company_charts(ticker: str) -> list[ChartResponse]:
    return get_company_charts(ticker)
