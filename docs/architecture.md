# LedgerLens Architecture

## Current foundation

- `apps/web` is a Next.js App Router workspace shell with dark-theme design tokens and the primary screen set scaffolded.
- `apps/api` is a FastAPI backend with route groups for health, companies, workspace, chat, bookmarks, sources, and charts.
- `packages/types` holds shared frontend contracts for workspaces, chat, charts, sources, and result typing.

## Next implementation priorities

1. Replace frontend mock data with typed backend fetches.
2. Live SEC / FRED / NewsAPI pulls are wired behind env keys; extend with more vendors, caching, and backoff policies.
3. Postgres stores ingested sources and FTS chunks when `DATABASE_URL` is set; Redis remains optional for sessions and rate limits.
4. Replace placeholder SSE text generation with an LLM provider abstraction and grounded retrieval context.
5. Add pgvector (or hosted embeddings) if semantic retrieval should go beyond keyword FTS.
