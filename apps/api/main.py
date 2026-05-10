import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.middleware import register_middleware
from api.routes import bookmarks, charts, chat, companies, health, sources, workspace
from database.config import is_database_configured

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if is_database_configured():
        try:
            from database.session import init_schema

            init_schema()
            logger.info("ledgerlens: postgres schema ready")
        except Exception:
            logger.exception("ledgerlens: postgres schema init failed; API will keep running without DB tables")
    yield


def _cors_allow_origins() -> list[str]:
    defaults = ["http://localhost:3000"]
    extra = os.getenv("ALLOWED_ORIGINS", "")
    parsed = [o.strip() for o in extra.split(",") if o.strip()]
    seen: set[str] = set()
    out: list[str] = []
    for origin in defaults + parsed:
        if origin not in seen:
            seen.add(origin)
            out.append(origin)
    return out


app = FastAPI(title="LedgerLens API", version="1.0.0", lifespan=lifespan)


@app.get("/")
async def root_liveness() -> dict[str, str]:
    """Fast probe for load balancers (no DB); use ``GET /health`` for DB status."""
    return {"status": "ok", "service": "ledgerlens-api"}


register_middleware(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(workspace.router, prefix="/workspace", tags=["workspace"])
app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
app.include_router(sources.router, prefix="/sources", tags=["sources"])
app.include_router(charts.router, prefix="/charts", tags=["charts"])
