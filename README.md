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
- **LLM (Ollama):** defaults to excerpt-only **stub** mode. For synthesized chat like local dev, set **`LLM_PROVIDER=ollama`**, **`OLLAMA_BASE_URL`** (e.g. `http://127.0.0.1:11434` locally, or `http://<ollama-service>.railway.internal:11434` when both services run on Railway), and **`OLLAMA_MODEL`** (e.g. `llama3.2:3b`). The API container must be able to reach that URL over the network. Optional tuning: **`OLLAMA_CHAT_NUM_PREDICT`** (max new tokens, default `1200`), **`OLLAMA_CHAT_TEMPERATURE`**, **`OLLAMA_CHAT_TOP_P`**, **`OLLAMA_NUM_CTX`** (context window cap when set). For **LoRA / QLoRA** training (GPU, separate from the API), see `scripts/lora/README.md`.

Railway / ops notes:

- **Postgres `duplicate key … ll_sources_pkey` (`fred-fedfunds-…`):** macro rows are keyed **per ticker** (e.g. `GOOG-fred-fedfunds-2026-04-01`). Older DB rows used global FRED IDs; deploy this API and run **`POST /sources/refresh?ticker=…`** again for each company so inserts succeed.
- **Ollama `truncating input prompt`:** filing RAG can exceed the runner context (often **4096** tokens on low RAM). Most excerpts are dropped silently → generic answers. On the **Ollama** service raise **`OLLAMA_CONTEXT_LENGTH`** (e.g. `8192`) if memory allows, and set **`OLLAMA_NUM_CTX`** on the API to match.
- **`pg_stat_statements` does not exist:** harmless noise from Railway’s query UI on Postgres without that extension.

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
