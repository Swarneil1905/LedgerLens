# LedgerLens Architecture

## Current foundation

- `apps/web` is a Next.js App Router workspace shell with dark-theme design tokens and the primary screen set scaffolded.
- `apps/api` is a FastAPI backend with route groups for health, companies, workspace, chat, bookmarks, sources, and charts.
- `packages/types` holds shared frontend contracts for workspaces, chat, charts, sources, and result typing.

## Next implementation priorities

1. Replace frontend mock data with typed backend fetches.
2. Add real source connectors for SEC, FRED, and news providers.
3. Move persistence from in-memory stubs to Postgres and Redis.
4. Replace placeholder SSE text generation with an LLM provider abstraction and grounded retrieval context.
