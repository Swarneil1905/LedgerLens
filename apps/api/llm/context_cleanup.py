"""Lightweight excerpt cleanup so local LLMs see financial prose, not HTML/XBRL chrome."""

from __future__ import annotations

import re
import html as html_module

_STOPWORDS = frozenset(
    """
    the a an and or but in on at to for of as by is are was were be been it its if so do we
    you can any how why who all not no may more most other such than then them these those
    this that with from your have has had does did will would could should about into also
    """.split()
)


def _keywords_from_question(question: str, limit: int = 10) -> list[str]:
    words = re.findall(r"[a-zA-Z]{4,}", question.lower())
    out: list[str] = []
    for w in words:
        if w in _STOPWORDS or w in out:
            continue
        out.append(w)
        if len(out) >= limit:
            break
    return out


def scrub_excerpt_text(text: str) -> str:
    """Strip residual markup entities and noisy tokens common in EDGAR HTML / iXBRL dumps."""
    t = html_module.unescape(text)
    t = re.sub(r"(?i)<\?xml[^>]*\?>", " ", t)
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", t)
    t = re.sub(r"(?s)<!--.*?-->", " ", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"(?i)\b(ins|xbrl|ixbrl|linkbase|schema)\s+element\b", " ", t)
    # Inline XBRL QName / taxonomy tokens that survive tag stripping ("dimension soup")
    t = re.sub(
        r"\b(?:us-gaap|meta|xbrli|srt|dei|ecd|ix|country|currency|stpr|exch):[A-Za-z0-9_.]+\b",
        " ",
        t,
        flags=re.I,
    )
    # Ticker-prefixed iXBRL (e.g. goog:SeniorNotesDue2028Member) — not covered by us-gaap:
    t = re.sub(
        r"\b(?!https?)([a-z]{3,8}):[A-Za-z][A-Za-z0-9_.]{2,}\b",
        " ",
        t,
        flags=re.I,
    )
    t = re.sub(r"\biso4217:[A-Za-z0-9]+\b", " ", t, flags=re.I)
    # Long runs of zero-padded 10-digit SEC identifiers (context tables), not prose
    t = re.sub(r"(?:\b0\d{9}\b\s*){4,}", " ", t)
    # iXBRL file name prefixes sometimes leak as bare tokens (e.g. meta-20260331)
    t = re.sub(r"\bmeta-\d{8}\b", " ", t, flags=re.I)
    # Taxonomy / registry URLs and other long tokens common in iXBRL dumps
    t = re.sub(r"https?://[^\s]+", " ", t)
    t = re.sub(r"\b[a-z]{2,10}-\d{8}\b", " ", t, flags=re.I)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def focus_excerpt_on_question(excerpt: str, question: str, max_chars: int = 14000) -> str:
    """Prefer sentences that overlap the user's question when the excerpt is very long."""
    keys = _keywords_from_question(question)
    cleaned = scrub_excerpt_text(excerpt)
    if len(cleaned) <= max_chars or not keys:
        return cleaned[:max_chars]
    parts = re.split(r"(?<=[.!?])\s+", cleaned)
    hits: list[str] = []
    rest: list[str] = []
    for p in parts:
        pl = p.lower()
        if any(k in pl for k in keys):
            hits.append(p)
        else:
            rest.append(p)
    ordered = hits + rest
    body = " ".join(ordered).strip()
    if len(body) < 400:
        body = cleaned[:max_chars]
    return body[:max_chars]
