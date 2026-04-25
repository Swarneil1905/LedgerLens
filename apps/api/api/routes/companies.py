from fastapi import APIRouter, Query

from memory.sec_company_index import load_company_index, search_companies_sec
from schemas.workspace import CompanyResponse

router = APIRouter()


@router.get("/search", response_model=list[CompanyResponse])
async def company_search(q: str = Query(min_length=1)) -> list[CompanyResponse]:
    await load_company_index()
    return search_companies_sec(q)
