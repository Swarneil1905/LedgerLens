from fastapi import APIRouter
from sqlalchemy import create_engine, text

from database.config import database_url

router = APIRouter()


@router.get("")
async def get_health() -> dict[str, object]:
    version = "1.0.0"
    url = database_url()
    db_connected = False
    if url:
        try:
            engine = create_engine(url, pool_pre_ping=True)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            db_connected = True
        except Exception:
            db_connected = False
    return {"status": "ok", "version": version, "db_connected": db_connected}
