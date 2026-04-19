# LedgerLens

LedgerLens is an AI analyst workspace for filings, macro data, news, and grounded business insight.

This repository is organized as a monorepo with:

- `apps/web`: Next.js workspace UI
- `apps/api`: FastAPI backend
- `packages/types`: shared TypeScript contracts
- `packages/observability`: shared event typing

## Getting Started

```bash
pnpm install
pnpm dev
```

Backend:

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
