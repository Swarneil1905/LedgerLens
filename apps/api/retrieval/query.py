def expand_query(question: str) -> list[str]:
    base = [question, f"{question} risks", f"{question} catalysts"]
    lowered = question.lower()
    filing_hints = "10-K 10-Q quarterly MD&A revenue earnings risk factors"
    if any(
        k in lowered
        for k in (
            "quarter",
            "filing",
            "10-q",
            "10-k",
            "prior",
            "versus",
            " vs ",
            "yoy",
            "qoq",
            "md&a",
            "mda",
        )
    ):
        base.append(f"{question} {filing_hints}")
    return base


def question_prefers_periodic_filings(question: str) -> bool:
    """Prefer 10-Q/10-K chunks when the question is about periodic financial reports."""
    lowered = question.lower()
    keys = (
        "quarter",
        "10-q",
        "10-k",
        "prior quarter",
        "qoq",
        "yoy",
        "versus",
        " vs.",
        "filing",
        "md&a",
        "mda",
        "earnings",
        "revenue",
        "financial results",
    )
    return any(k in lowered for k in keys)
