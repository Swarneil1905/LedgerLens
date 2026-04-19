from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.middleware import register_middleware
from api.routes import bookmarks, charts, chat, companies, health, sources, workspace


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title="LedgerLens API", version="1.0.0", lifespan=lifespan)
register_middleware(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
