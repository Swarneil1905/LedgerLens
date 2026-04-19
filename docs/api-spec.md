# API Spec

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
