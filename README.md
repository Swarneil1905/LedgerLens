# LedgerLens

LedgerLens is an AI analyst workspace for filings, macro data, news, and grounded business insight.

Monorepo layout:

- `apps/web`: Next.js 15 (App Router) workspace UI
- `apps/api`: FastAPI backend (SSE chat, workspaces, bookmarks, sources)
- `packages/types`: shared TypeScript contracts
- `packages/observability`: shared event typing

## Prerequisites

- Node.js 22+ and [pnpm](https://pnpm.io/) 10+ (or run pnpm via `npx pnpm@10.8.1`)
- Python 3.11+ (3.12 recommended; CI uses 3.12)

## Environment

Copy `.env.example` to `apps/web/.env.local` for the frontend and export variables for the API as needed.

- `NEXT_PUBLIC_API_BASE_URL`: FastAPI origin (default `http://localhost:8000`). You may also set `NEXT_PUBLIC_API_URL`; the web app accepts either.
- Optional: `DATABASE_URL`: when set and reachable, `GET /health` reports `db_connected: true`.
- For live macro on `POST /sources/refresh`, set **`FRED_API_KEY`** (see [FRED API keys](https://fred.stlouisfed.org/docs/api/api_key.html)) in the same environment as `uvicorn` (shell export, IDE run config, or container env). Optional **`FRED_SERIES_ID`** defaults to `FEDFUNDS`.
- **LLM (Ollama):** defaults to excerpt-only **stub** mode. For synthesized chat like local dev, set **`LLM_PROVIDER=ollama`**, **`OLLAMA_BASE_URL`** (e.g. `http://127.0.0.1:11434` locally, or `http://<ollama-service>.railway.internal:11434` when both services run on Railway), and **`OLLAMA_MODEL`** (e.g. `llama3.2:3b`). The API container must be able to reach that URL over the network.

## Run locally

1. Install JS dependencies (from repo root):

   ```bash
   pnpm install
   ```

2. Start the API (new terminal, from `apps/api`):

   ```bash
   cd apps/api
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. Start the web app (repo root):

   ```bash
   pnpm dev
   ```

4. Open `http://localhost:3000`. Use company search, open a workspace, then **Start analysis** to open a chat session with `?ticker=` set.

## Quality checks

```bash
pnpm lint
pnpm type-check
pnpm build
```

Backend (from `apps/api`):

```bash
pip install ruff pytest
ruff check .
pytest tests
```

## Docker (API)

From the repository root (build context is `apps/api`):

```bash
docker build -f apps/api/Dockerfile -t ledgerlens-api apps/api
docker run --rm -p 8000:8000 ledgerlens-api
```

## Documentation

See `docs/architecture.md`, `docs/api-spec.md`, and `docs/data-sources.md` for deeper design notes.
