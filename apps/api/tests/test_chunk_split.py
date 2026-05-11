from datetime import datetime, timezone

from retrieval.chunk_split import index_slices_for_source, split_evidence_body
from schemas.source import SourceResponse, SourceType


def test_split_evidence_body_short_single_chunk() -> None:
    assert split_evidence_body("hello") == ["hello"]


def test_split_evidence_body_long_produces_multiple() -> None:
    para = "word " * 2000
    body = para.strip()
    parts = split_evidence_body(body)
    assert len(parts) >= 2
    assert all(len(p) <= 8500 for p in parts)


def test_index_slices_splits_large_periodic_filing() -> None:
    big = "x" * 12000
    src = SourceResponse(
        id="sec-test",
        source_type=SourceType.FILING,
        title="COBJ 10-Q (2024-05-01)",
        provider="SEC EDGAR",
        date=datetime.now(timezone.utc),
        url=None,
        ticker="COBJ",
        snippet=big,
        metadata={"form_type": "10-Q"},
    )
    slices = index_slices_for_source(src)
    assert len(slices) >= 2
    assert all("segment" in sl.lower() for sl in slices)


def test_index_slices_no_split_small_filing() -> None:
    src = SourceResponse(
        id="sec-small",
        source_type=SourceType.FILING,
        title="COBJ 8-K (2024-05-01)",
        provider="SEC EDGAR",
        date=datetime.now(timezone.utc),
        url=None,
        ticker="COBJ",
        snippet="Brief item.",
        metadata={"form_type": "8-K"},
    )
    slices = index_slices_for_source(src)
    assert len(slices) == 1
