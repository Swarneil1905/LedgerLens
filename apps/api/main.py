import asyncio
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

    # Load SEC ticker list before serving traffic (bounded wait). Avoids a background
    # task that must be cancelled on shutdown (noisy tracebacks on Ctrl+C locally) and
    # reduces first-request 502s on Railway when the proxy times out before SEC returns.
    try:
        from memory.sec_company_index import load_company_index

        await asyncio.wait_for(load_company_index(), timeout=28.0)
        logger.info("ledgerlens: SEC company index preload finished")
    except TimeoutError:
        logger.warning(
            "ledgerlens: SEC company index preload timed out; company search may be empty until SEC responds"
        )
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception("ledgerlens: SEC company index preload failed")

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

# CORS last among add_middleware so it wraps all routes and the request logger.
app.add_middleware(
    CORSMiddleware,
    **_cors_middleware_kwargs(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_middleware(app)
