from fastapi import APIRouter

from memory.persistence import add_bookmark, list_bookmarks
from schemas.source import BookmarkRequest, BookmarkResponse

router = APIRouter()


@router.get("", response_model=list[BookmarkResponse])
async def get_bookmarks() -> list[BookmarkResponse]:
    return list_bookmarks()


@router.post("", response_model=BookmarkResponse)
async def create_bookmark(request: BookmarkRequest) -> BookmarkResponse:
    return add_bookmark(request.source_id)
