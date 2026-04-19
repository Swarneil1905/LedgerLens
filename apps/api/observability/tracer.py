from dataclasses import dataclass


@dataclass(slots=True)
class RetrievalTrace:
    question: str
    ticker: str
    source_count: int
