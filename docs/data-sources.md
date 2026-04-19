# Data Sources

## Scaffolded connectors

- `SEC EDGAR`: filing connector placeholder in `apps/api/data_sources/sec.py`
- `FRED`: macro series placeholder in `apps/api/data_sources/fred.py`
- `NewsAPI`, `Exa`, `GDELT`: three news provider placeholders in `apps/api/data_sources/news_a.py`, `news_b.py`, and `news_c.py`

## Planned production behavior

- Normalize all source output into the common `SourceResponse` schema.
- Persist normalized sources for retrieval, bookmarking, and citation rendering.
- Add request throttling, response validation, and fallback behavior per provider.
