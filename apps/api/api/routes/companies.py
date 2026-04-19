from fastapi import APIRouter, Query

from memory.persistence import search_companies
from schemas.workspace import CompanyResponse

router = APIRouter()


@router.get("/search", response_model=list[CompanyResponse])
async def company_search(q: str = Query(min_length=1)) -> list[CompanyResponse]:
    return search_companies(q)
