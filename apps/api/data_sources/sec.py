from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timezone

import httpx

from data_sources.http_tools import sec_headers
from schemas.source import SourceResponse, SourceType

logger = logging.getLogger(__name__)

_TICKER_JSON_URL = "https://www.sec.gov/files/company_tickers.json"
_SUBMISSIONS_TMPL = "https://data.sec.gov/submissions/CIK{cik}.json"
_MAX_FILINGS = 5
_MAX_EXCERPT_FETCHES = 5
_EXCERPT_CHARS = 24000
_TARGET_FORMS = {"10-K", "10-Q", "8-K"}
# Prefer periodic reports (10-Q before 10-K) so quarterly questions get quarterly text first.
_FORM_RANK = {"10-Q": 0, "10-K": 1, "8-K": 2}


def _html_to_text(html: str) -> str:
    """Strip HTML/XBRL noise from SEC filing documents before excerpting."""
    # 0. Strip HTML comments (not in user spec; keeps MD&A tables cleaner)
    html = re.sub(r"(?s)<!--.*?-->", "", html)
    # 1. Remove entire <script>, <style>, and ix:* XBRL tag blocks
    html = re.sub(r"(?is)<script[^>]*>.*?</script>", "", html)
    html = re.sub(r"(?is)<style[^>]*>.*?</style>", "", html)
    html = re.sub(r"(?is)<ix:[^>]+>.*?</ix:[^>]+>", "", html)
    # 2. Remove all remaining HTML tags
    html = re.sub(r"<[^>]+>", " ", html)
    # 3. Remove XBRL artifacts — booleans, ISO durations, 10-digit IDs
    html = re.sub(r"\b(FALSE|TRUE|P\d+Y\w*|\d{10})\b", "", html, flags=re.IGNORECASE)
    # 4. Drop lines that are mostly dates / IDs / duration tokens
    lines = html.splitlines()
    clean_lines: list[str] = []
    for line in lines:
        tokens = line.split()
        if not tokens:
            continue
        junk_tokens = sum(
            1
            for t in tokens
            if re.match(r"^\d{4}-\d{2}-\d{2}$", t)
            or re.match(r"^\d{8,}$", t)
            or re.match(r"^P\d", t, re.IGNORECASE)
            or t.upper() in ("FALSE", "TRUE", "NAN")
        )
        if len(tokens) > 0 and junk_tokens / len(tokens) > 0.4:
            continue
        clean_lines.append(line)
    html = "\n".join(clean_lines)
    # 5. Collapse whitespace
    html = re.sub(r"\s{3,}", "\n\n", html)
    html = re.sub(r"[ \t]+", " ", html)
    # 6. Remove null bytes and non-printable characters
    html = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", html)
    return html.strip()


def _archives_url(cik: int, accession: str, primary_document: str) -> str:
    acc_nodash = accession.replace("-", "")
    arch_cik = str(int(cik))
    return f"https://www.sec.gov/Archives/edgar/data/{arch_cik}/{acc_nodash}/{primary_document}"


async def _fetch_filing_excerpt(
    client: httpx.AsyncClient, cik: int, accession: str, primary_document: str
) -> str:
    if not primary_document.strip():
        return ""
    url = _archives_url(cik, accession, primary_document)
    try:
        r = await client.get(url, headers=sec_headers())
        r.raise_for_status()
        raw = r.text
        ct = (r.headers.get("content-type") or "").lower()
        if "html" in ct or primary_document.lower().endswith((".htm", ".html")):
            return _html_to_text(raw)[:_EXCERPT_CHARS]
        return raw.strip()[:_EXCERPT_CHARS]
    except Exception:
        logger.warning("SEC: excerpt fetch failed for %s", url, exc_info=True)
        return ""


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

        rows: list[tuple[int, str, str, str, str, str]] = []
        scan = min(len(forms), len(dates), len(accessions), 80)
        for i in range(scan):
            form = forms[i]
            if form not in _TARGET_FORMS:
                continue
            accession = accessions[i]
            doc = docs[i] if i < len(docs) else ""
            desc = titles[i] if i < len(titles) else form
            rows.append((i, str(form), str(dates[i]), str(accession), str(doc), str(desc)))

        rows.sort(key=lambda row: (_FORM_RANK.get(row[1], 9), row[0]))
        picked = rows[:_MAX_FILINGS]

        out: list[SourceResponse] = []
        for i, form, date_s, accession, doc, desc in picked:
            filing_date = _parse_date(date_s)
            viewer = (
                f"https://www.sec.gov/cgi-bin/viewer?action=view&cik={cik_padded}"
                f"&accession_number={accession}&xbrl_type=v"
            )
            snippet = (desc or form)[:500]
            out.append(
                SourceResponse(
                    id=f"sec-{accession.replace('-', '')}-{form}",
                    source_type=SourceType.FILING,
                    title=f"{upper} {form} ({date_s})",
                    provider="SEC EDGAR",
                    date=filing_date,
                    url=viewer,
                    ticker=upper,
                    snippet=snippet,
                    metadata={
                        "form_type": form,
                        "accession_number": accession,
                        "primary_document": doc,
                    },
                )
            )

        fetches = 0
        enriched: list[SourceResponse] = []
        for src in out:
            form = str(src.metadata.get("form_type") or "")
            if form not in ("10-K", "10-Q") or fetches >= _MAX_EXCERPT_FETCHES:
                enriched.append(src)
                continue
            acc = str(src.metadata.get("accession_number") or "")
            doc = str(src.metadata.get("primary_document") or "")
            if not acc or not doc:
                enriched.append(src)
                continue
            body = await _fetch_filing_excerpt(client, cik, acc, doc)
            fetches += 1
            if body:
                enriched.append(src.model_copy(update={"snippet": body[:45000]}))
            else:
                enriched.append(src)
            await asyncio.sleep(0.35)

        return enriched
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
