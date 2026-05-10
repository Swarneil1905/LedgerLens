from fastapi import APIRouter
from sqlalchemy import text

from database.config import database_url
from database.session import get_engine

router = APIRouter()


@router.get("")
async def get_health() -> dict[str, object]:
    version = "1.0.0"
    url = database_url()
    db_connected = False
    if url:
        try:
            with get_engine().connect() as connection:
                connection.execute(text("SELECT 1"))
            db_connected = True
        except Exception:
            db_connected = False
    return {"status": "ok", "version": version, "db_connected": db_connected}
