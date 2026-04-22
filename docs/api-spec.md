# API Spec

## Connectors and storage

- `POST /sources/refresh` pulls live SEC submissions (requires descriptive `SEC_HTTP_USER_AGENT`), latest FRED observation when `FRED_API_KEY` is set, and NewsAPI articles when `NEWS_API_KEY` is set.
- With `DATABASE_URL`, ingested sources and search chunks are written to Postgres; `GET /sources/company/{ticker}` prefers the database after a refresh.

## Implemented route surface

- `GET /health`
- `GET /companies/search?q=`
- `POST /workspace/create`
- `GET /workspace/{workspace_id}`
- `POST /chat/query`
- `GET /chat/{session_id}/history`
- `GET /bookmarks`
- `POST /bookmarks`
- `POST /sources/refresh?ticker=`
- `GET /sources/company/{ticker}`
- `GET /charts/company/{ticker}`

## Streaming events

`POST /chat/query` currently emits:

- `text`
- `sources`
- `followups`
- `done`

`chart` support is planned in the next backend slice.
