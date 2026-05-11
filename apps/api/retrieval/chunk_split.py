"""Split long filing excerpts into overlapping FTS chunks (multiple rows per source)."""

from __future__ import annotations

from schemas.source import SourceResponse, SourceType

MAX_CHARS_PER_CHUNK = 6200
CHUNK_OVERLAP = 450
MIN_BODY_CHARS_TO_SPLIT = 8500
MAX_SUB_CHUNKS_PER_SOURCE = 24
CONTENT_HARD_CAP = 52000


def source_should_split(s: SourceResponse) -> bool:
    """Only split bulky periodic filings; keep news/macro as single slices."""
    if s.source_type != SourceType.FILING:
        return False
    form = str(s.metadata.get("form_type") or "")
    if form not in ("10-Q", "10-K"):
        return False
    body = f"{s.title.strip()}. {s.snippet.strip()}".strip()
    return len(body) >= MIN_BODY_CHARS_TO_SPLIT


def split_evidence_body(body: str) -> list[str]:
    """Greedy windows with overlap; prefer paragraph then sentence then spaces."""
    text = body.strip()
    if not text:
        return []
    if len(text) <= MAX_CHARS_PER_CHUNK:
        return [text]

    chunks: list[str] = []
    start = 0
    n = len(text)
    while start < n and len(chunks) < MAX_SUB_CHUNKS_PER_SOURCE:
        end = min(start + MAX_CHARS_PER_CHUNK, n)
        if end < n:
            window = text[start:end]
            break_pts = [
                window.rfind("\n\n"),
                window.rfind(". "),
                window.rfind("\n"),
                window.rfind(" "),
            ]
            bp = max(break_pts)
            min_take = MAX_CHARS_PER_CHUNK // 3
            if bp >= min_take:
                advance = 2 if window[bp : bp + 2] == "\n\n" else 1
                end = start + bp + advance

        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)
        if end >= n:
            break
        next_start = end - CHUNK_OVERLAP
        if next_start <= start:
            next_start = start + max(256, MAX_CHARS_PER_CHUNK // 2)
        start = next_start

    if not chunks:
        return [text[:MAX_CHARS_PER_CHUNK]]
    return chunks


def index_slices_for_source(s: SourceResponse) -> list[str]:
    """Content strings for ``ll_source_chunks`` rows tied to this source."""
    title = s.title.strip()
    snippet = s.snippet.strip()
    body = f"{title}. {snippet}".strip()
    if not body:
        return []

    if source_should_split(s):
        parts = split_evidence_body(body)
        total = len(parts)
        out = []
        for i, p in enumerate(parts):
            head = f"{title} — segment {i + 1}/{total}\n\n"
            chunk = head + p
            if len(chunk) > CONTENT_HARD_CAP:
                chunk = chunk[:CONTENT_HARD_CAP]
            out.append(chunk)
        return out

    return [body[:CONTENT_HARD_CAP]]
