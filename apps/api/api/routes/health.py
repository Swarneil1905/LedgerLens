from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def get_health() -> dict[str, object]:
    return {"status": "ok", "version": "0.0.1", "db_connected": False}
