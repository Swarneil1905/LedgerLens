import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.middleware import register_middleware
from api.routes import bookmarks, charts, chat, companies, health, sources, workspace
from database.config import is_database_configured

# After imports (Ruff E402): load ``apps/api/.env`` when present. Railway uses real env vars.
load_dotenv(Path(__file__).resolve().parent / ".env", override=False)

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
    parsed = [o.strip().rstrip("/") for o in extra.split(",") if o.strip()]
    seen: set[str] = set()
    out: list[str] = []
    for origin in defaults + parsed:
        origin = origin.strip().rstrip("/")
        if origin not in seen:
            seen.add(origin)
            out.append(origin)
    return out


def _cors_allow_origin_regex() -> str | None:
    """Optional regex so Railway preview URLs work even if ALLOWED_ORIGINS drifts (trailing slash, typo)."""
    raw = os.getenv("CORS_ALLOW_RAILWAY_REGEX", "1").strip().lower()
    if raw in ("0", "false", "no", "off"):
        return None
    # e.g. https://web-production-4205d.up.railway.app
    return r"https://[\w.-]+\.up\.railway\.app$"


def _cors_middleware_kwargs() -> dict[str, object]:
    """
    Default: allow any origin with credentials off (this API does not use cookies).
    That always emits ``Access-Control-Allow-Origin`` when the app returns a response,
    which avoids brittle Railway preview hostname matching.

    Set ``CORS_RESTRICT=1`` and ``ALLOWED_ORIGINS`` for a locked-down deployment.
    """
    restrict = os.getenv("CORS_RESTRICT", "").strip().lower() in ("1", "true", "yes")
    if restrict:
        return {
            "allow_origins": _cors_allow_origins(),
            "allow_origin_regex": _cors_allow_origin_regex(),
        }
    return {"allow_origins": ["*"], "allow_origin_regex": None}


app = FastAPI(title="LedgerLens API", version="1.0.0", lifespan=lifespan)

# CORS first (FastAPI/Starlette pattern): wraps the app before routes + other middleware.
app.add_middleware(
    CORSMiddleware,
    **_cors_middleware_kwargs(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root_liveness() -> dict[str, str]:
    """Fast probe for load balancers (no DB); use ``GET /health`` for DB status."""
    return {"status": "ok", "service": "ledgerlens-api"}


app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(workspace.router, prefix="/workspace", tags=["workspace"])
app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
app.include_router(sources.router, prefix="/sources", tags=["sources"])
app.include_router(charts.router, prefix="/charts", tags=["charts"])

register_middleware(app)
