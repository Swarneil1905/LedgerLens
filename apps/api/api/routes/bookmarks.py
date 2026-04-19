from fastapi import APIRouter, HTTPException, Response

from memory.persistence import add_bookmark, list_bookmarks, remove_bookmark
from schemas.source import BookmarkRequest, BookmarkResponse

router = APIRouter()


@router.get("", response_model=list[BookmarkResponse])
async def get_bookmarks() -> list[BookmarkResponse]:
    return list_bookmarks()


@router.post("", response_model=BookmarkResponse)
async def create_bookmark(request: BookmarkRequest) -> BookmarkResponse:
    return add_bookmark(request.source_id)


@router.delete("/{bookmark_id}", status_code=204)
async def delete_bookmark(bookmark_id: str) -> Response:
    removed = remove_bookmark(bookmark_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return Response(status_code=204)
