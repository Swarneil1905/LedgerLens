"""Bind to ``PORT`` (Railway, Fly, Render) instead of a hardcoded port."""

import os

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        # Railway terminates TLS at the edge and forwards HTTP; keep forwarded headers sane.
        proxy_headers=True,
        forwarded_allow_ips="*",
    )
