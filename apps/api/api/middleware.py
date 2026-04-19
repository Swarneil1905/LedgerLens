import time
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response

from observability.logger import log_event


def register_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def request_logger(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        started_at = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        log_event(
            "info",
            "http.request",
            "Request completed",
            {
                "path": request.url.path,
                "method": request.method,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
