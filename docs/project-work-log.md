# LedgerLens — Project Work Log

This document consolidates **what has been implemented so far** across the LedgerLens monorepo (web + API + shared packages), based on the current code and the repository’s commit history.

## Repository snapshot

- **Repo**: `LedgerLens` (`origin`: `https://github.com/Swarneil1905/ledgerlens.git`)
- **Monorepo layout** (from `README.md`)
  - `apps/web`: Next.js (App Router) workspace UI
  - `apps/api`: FastAPI backend (chat via SSE, workspaces, bookmarks, sources)
  - `packages/types`: shared TypeScript contracts
  - `packages/observability`: shared event typing

## What the product does (current foundation)

- **Workspace experience**: search/select a company (ticker), open a workspace, start an analysis session.
- **Grounding inputs (sources)**: filings + macro + news, refreshed on-demand.
- **Chat**: backend streams structured events over SSE (text, sources, follow-ups, done).
- **Persistence (optional)**: when `DATABASE_URL` is configured, ingested sources are stored in Postgres and chunked for search.

## Backend (FastAPI) — implemented capabilities

### Route surface (current)

From `docs/api-spec.md` (and implemented routers in `apps/api/main.py`):

- `GET /health`
- `GET /companies/search?q=`
- `POST /workspace/create`
- `GET /workspace/{workspace_id}`
- `POST /chat/query` (SSE)
- `GET /chat/{session_id}/history`
- `GET /bookmarks`
- `POST /bookmarks`
- `POST /sources/refresh?ticker=`
- `GET /sources/company/{ticker}`
- `GET /charts/company/{ticker}`

### Streaming chat events

`POST /chat/query` emits:

- `text`
- `sources`
- `followups`
- `done`

(`chart` is noted as planned in `docs/api-spec.md`.)

### Data sources and refresh pipeline

From `docs/data-sources.md`:

- **SEC EDGAR**: `apps/api/data_sources/sec.py`
  - **Env**: `SEC_HTTP_USER_AGENT` (recommended)
  - **Behavior**: uses `data.sec.gov` submissions JSON; defensive downgrade to empty lists on errors.
- **FRED**: `apps/api/data_sources/fred.py`
  - **Env**: `FRED_API_KEY` (required), optional `FRED_SERIES_ID` (default `FEDFUNDS`)
  - **Behavior**: fetch latest observation; skipped if key is unset.
- **NewsAPI**: `apps/api/data_sources/news_a.py`
  - **Env**: `NEWS_API_KEY`
  - **Behavior**: `everything` query by ticker; skipped if key is unset.
- **Extra wires**: `news_b.py`, `news_c.py` currently return empty lists until wired.

Refresh orchestration:

- `POST /sources/refresh?ticker=` calls `gather_company_sources`, then `memory.persistence.replace_company_sources`.

### Persistence + retrieval (when Postgres is configured)

From `docs/data-sources.md` and the current API plumbing:

- **Storage tables**:
  - `ll_sources`: JSON payload per ingested source
  - `ll_source_chunks`: title + snippet text (searchable)
- **Retrieval**:
  - `apps/api/retrieval/vector_store.py` uses Postgres **FTS** (`tsvector` + `plainto_tsquery`) via `database.repository.search_chunks`.

### Refresh throttling (production safety)

Implemented a per-ticker throttling guard in `apps/api/api/refresh_throttle.py`:

- Enforces **single in-flight refresh per ticker**
- Enforces **cooldown** in production by default (or via `SOURCES_REFRESH_MIN_INTERVAL_SECONDS`)
- Returns **HTTP 429** with `Retry-After` headers when rate-limited

### Resilience / operational behavior

- API can run without DB tables if schema initialization fails (logs error, continues serving).
- Connectors are defensive: on HTTP/parse errors, they downgrade to empty results (rather than crashing the refresh).

## Web (Next.js) — implemented capabilities

### UI foundations and iterations

From commit history (high level):

- Established the App Router UI shell and iterated heavily on:
  - typography, layout consistency, and responsiveness
  - sidebar/navigation improvements
  - chart + chat panel UI refinements
  - error UI consistency

### UX milestones

- Added **Start analysis** flow (replacing a direct link) for improved workspace→session UX.
- Added an **About** page with an SVG diagram and motion.
- Updated viewport configuration + layout responsiveness.

### Tooling / quality

- Tailwind CSS integration and dependency updates
- Added ESLint config so `next lint` works in CI
- Tracked pnpm lockfile for reproducible installs; adjusted CI workflow around pnpm

## Docs added / kept up to date

- `docs/architecture.md`: current foundation + next priorities (typed fetches, more connectors, caching/backoff, LLM abstraction, optional semantic retrieval).
- `docs/api-spec.md`: implemented API surface + streaming event types.
- `docs/data-sources.md`: connector inventory, refresh pipeline, persistence/search expectations.

## Timeline of completed work (from git commits)

This is a **milestone-oriented** grouping of the repository history.

### Foundation + repo hygiene

- Baseline monorepo structures (`V.1`, `V1.1`).
- CI/install hygiene:
  - pnpm lockfile tracked for reproducible installs
  - ESLint config added so `next lint` passes in CI
  - workflow adjustments around pnpm versioning

### Web app milestones

- Tailwind + layout modernization; Vercel Analytics added; deprecated workspace page removed.
- Workspace header and breadcrumb enhancements across chat/workspace pages.
- Multiple rounds of UI polish (typography, colors, responsive sidebar/top bar, chart/chat components).
- About page added with diagram + motion.
- “Start analysis” UX improvements and related text/navigation tweaks.
- Responsive viewport configuration updates.

### API milestones

- Added CORS support and environment configuration.
- Improved error handling patterns (including optional ApiError parameters).
- Company search and workspace handling updates (including legacy slug-to-ticker compatibility behavior).
- SEC data handling + error management improvements.
- FRED data source configuration and error handling improvements; removed unused imports.
- Implemented refresh throttling for sources refresh.
- Implemented Postgres persistence for ingested sources + FTS chunks for retrieval.
- Simplified chunk search logic in retrieval layer.
- Improved health/db connection handling and messaging.

## Current “next priorities” (as documented in-repo)

From `docs/architecture.md`:

- Replace frontend mock data with typed backend fetches.
- Expand connector coverage and operational policies (caching, backoff, more vendors).
- Keep Postgres as the default grounding store when configured; Redis optional.
- Replace placeholder SSE generation with an LLM provider abstraction using grounded retrieval context.
- Add pgvector/hosted embeddings if semantic retrieval beyond FTS is required.

