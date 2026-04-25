from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx

from data_sources.http_tools import sec_headers
from schemas.source import SourceResponse, SourceType

logger = logging.getLogger(__name__)

_TICKER_JSON_URL = "https://www.sec.gov/files/company_tickers.json"
_SUBMISSIONS_TMPL = "https://data.sec.gov/submissions/CIK{cik}.json"
_MAX_FILINGS = 5
_TARGET_FORMS = {"10-K", "10-Q", "8-K"}


async def fetch_filings(client: httpx.AsyncClient, ticker: str) -> list[SourceResponse]:
    upper = ticker.upper()
    try:
        cik = await _resolve_cik(client, upper)
        if cik is None:
            logger.warning("SEC: no CIK for ticker %s", upper)
            return []
        cik_padded = str(cik).zfill(10)
        url = _SUBMISSIONS_TMPL.format(cik=cik_padded)
        r = await client.get(url, headers=sec_headers())
        r.raise_for_status()
        data = r.json()
        recent = (data.get("filings") or {}).get("recent") or {}
        forms = recent.get("form") or []
        dates = recent.get("filingDate") or []
        accessions = recent.get("accessionNumber") or []
        docs = recent.get("primaryDocument") or []
        titles = recent.get("primaryDocDescription") or []

        out: list[SourceResponse] = []
        for i in range(min(len(forms), len(dates), len(accessions))):
            if len(out) >= _MAX_FILINGS:
                break
            form = forms[i]
            if form not in _TARGET_FORMS:
                continue
            accession = accessions[i]
            doc = docs[i] if i < len(docs) else ""
            desc = titles[i] if i < len(titles) else form
            filing_date = _parse_date(dates[i])
            viewer = (
                f"https://www.sec.gov/cgi-bin/viewer?action=view&cik={cik_padded}"
                f"&accession_number={accession}&xbrl_type=v"
            )
            snippet = (desc or form)[:280]
            out.append(
                SourceResponse(
                    id=f"sec-{accession.replace('-', '')}-{form}",
                    source_type=SourceType.FILING,
                    title=f"{upper} {form} ({dates[i]})",
                    provider="SEC EDGAR",
                    date=filing_date,
                    url=viewer,
                    ticker=upper,
                    snippet=snippet,
                    metadata={
                        "form_type": str(form),
                        "accession_number": str(accession),
                        "primary_document": str(doc) if doc else "",
                    },
                )
            )
        return out
    except httpx.HTTPError as exc:
        logger.warning("SEC filings fetch failed for %s: %s", upper, exc)
        return []
    except (KeyError, TypeError, ValueError) as exc:
        logger.warning("SEC filings parse failed for %s: %s", upper, exc)
        return []


async def _resolve_cik(client: httpx.AsyncClient, ticker: str) -> int | None:
    r = await client.get(_TICKER_JSON_URL, headers=sec_headers())
    r.raise_for_status()
    payload = r.json()
    if not isinstance(payload, dict):
        return None
    for row in payload.values():
        if not isinstance(row, dict):
            continue
        tick = row.get("ticker")
        cik_val = row.get("cik_str")
        if tick is None or cik_val is None:
            continue
        if str(tick).upper() == ticker:
            try:
                return int(cik_val)
            except (TypeError, ValueError):
                return None
    return None


def _parse_date(raw: object) -> datetime:
    try:
        return datetime.strptime(str(raw), "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime.now(timezone.utc)
