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
    """Strip residual markup entities and noisy tokens common in EDGAR HTML dumps."""
    t = html_module.unescape(text)
    t = re.sub(r"(?i)<\?xml[^>]*\?>", " ", t)
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", t)
    t = re.sub(r"(?s)<!--.*?-->", " ", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"(?i)\b(ins|xbrl|ixbrl|linkbase|schema)\s+element\b", " ", t)
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
