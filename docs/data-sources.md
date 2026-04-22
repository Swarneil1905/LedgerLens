# Data Sources

## Live connectors (when env is set)

| Provider | Module | Env vars | Notes |
|----------|--------|----------|--------|
| SEC EDGAR | `apps/api/data_sources/sec.py` | `SEC_HTTP_USER_AGENT` (recommended) | Uses `data.sec.gov` submissions JSON. Identify your traffic per SEC policy. |
| FRED | `apps/api/data_sources/fred.py` | `FRED_API_KEY` | Latest observation for `FEDFUNDS` (configurable later). Skipped if unset. |
| NewsAPI | `apps/api/data_sources/news_a.py` | `NEWS_API_KEY` | `everything` query by ticker, newest first. Skipped if unset. |
| Extra wires | `news_b.py`, `news_c.py` | n/a | Return empty lists until additional vendors are wired. |

## Refresh and persistence

- `POST /sources/refresh?ticker=` calls `gather_company_sources`, then `memory.persistence.replace_company_sources`.
- When `DATABASE_URL` points at Postgres, sources are stored in `ll_sources` (JSON payload) and `ll_source_chunks` (title + snippet text for search).
- Chat retrieval uses Postgres `tsvector` / `plainto_tsquery` over `ll_source_chunks` when the DB is configured; otherwise the legacy placeholder path still runs.

## Operational expectations

- Throttle refresh in production (not enforced in code yet).
- NewsAPI has daily caps on free tiers; SEC may rate-limit abusive clients.
- Validate outbound JSON defensively; connectors already downgrade to empty lists on HTTP or parse errors.
