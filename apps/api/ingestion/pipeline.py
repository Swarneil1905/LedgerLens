from ingestion.chunker import chunk_text
from ingestion.parser import parse_document


def ingest_text_document(raw_text: str) -> list[str]:
    parsed = parse_document(raw_text)
    return chunk_text(parsed)
