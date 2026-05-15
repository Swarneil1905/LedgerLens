from fastapi import APIRouter, HTTPException, Query

from memory.sec_company_index import all_companies, load_company_index, search_companies_sec
from schemas.workspace import CompanyResponse

router = APIRouter()


@router.get("/search", response_model=list[CompanyResponse])
async def company_search(q: str = Query(min_length=1)) -> list[CompanyResponse]:
    await load_company_index()
    if not all_companies():
        raise HTTPException(
            status_code=503,
            detail="Company index unavailable — SEC data could not be loaded. Try again in a moment.",
        )
    return search_companies_sec(q)
