import json
import logging
import re

logger = logging.getLogger(__name__)

FOLLOWUP_SYSTEM = """You suggest exactly 3 follow-up questions the user might ask next.
Rules:
- Each question must build on BOTH the user's prior question and the assistant reply (same ticker, same thread).
- Only suggest questions that could realistically be answered from **indexed SEC filings, macro series, and news** (segment notes, risk factors, capex, liquidity, rates, headlines)—not secret product roadmaps or unreleased metrics.
- If the assistant said the excerpts lack a topic, your follow-ups should pivot to what **is** likely in a 10-K/10-Q or news (e.g. segment revenue, R&D expense, risk factors)—not repeat the missing topic as if we have data.
- Phrase as concise questions (under 95 characters each). No numbering or bullets in your output.
- Output ONLY valid JSON with this shape: {"followups":["...","...","..."]}
- No markdown fences, no commentary outside the JSON.
"""


def build_followup_user_message(
    *,
    ticker: str,
    question: str,
    answer: str,
    indexed_source_lines: list[str] | None = None,
) -> str:
    clipped = answer.strip()[:3200]
    catalog = ""
    if indexed_source_lines:
        catalog = "Indexed evidence (titles only):\n" + "\n".join(indexed_source_lines) + "\n\n"
    return (
        f"Ticker: {ticker}\n"
        f"{catalog}"
        f"User question:\n{question.strip()}\n\n"
        f"Assistant reply (may be truncated):\n{clipped}\n\n"
        'Return JSON: {"followups":["...","...","..."]}'
    )


def parse_followup_json(raw: str) -> list[str]:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```\w*\s*", "", text)
        text = re.sub(r"\s*```\s*$", "", text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.debug("followup JSON parse failed: %s", text[:200])
        return []
    if isinstance(data, dict) and "followups" in data:
        items = data["followups"]
        if isinstance(items, list):
            return _trim_list(items)
    if isinstance(data, list):
        return _trim_list(data)
    return []


def _trim_list(items: list[object]) -> list[str]:
    out = [str(x).strip() for x in items if str(x).strip()]
    return out[:3]


def template_followups(question: str, ticker: str) -> list[str]:
    """Keyword-based follow-ups when the LLM path is unavailable."""
    q = question.strip().lower()
    t = ticker.upper()
    bank: list[str] = []

    if any(k in q for k in ("quarter", "10-q", "10-k", "filing", "md&a", "mda", "versus", "prior")):
        bank.extend(
            [
                f"Which line items in {t}'s latest excerpt moved the most versus the prior period?",
                f"What risks or legal matters does {t} flag in the indexed filing text?",
                f"Does the excerpt mention cash flow or liquidity for {t}, and how?",
            ]
        )
    if any(k in q for k in ("macro", "fred", "rate", "inflation", "fed")):
        bank.extend(
            [
                f"How does the FRED series in context relate to {t}'s demand story?",
                f"What macro downside would most stress {t} given the excerpts?",
                f"Which macro indicator should we watch next for {t}?",
            ]
        )
    if any(k in q for k in ("news", "headline", "sentiment")):
        bank.extend(
            [
                f"How do the indexed headlines compare to {t}'s filing tone?",
                f"What single news fact in the excerpts most affects {t}?",
                f"What should we verify next in SEC text for {t} after these headlines?",
            ]
        )
    if any(k in q for k in ("revenue", "margin", "eps", "earnings", "growth")):
        bank.extend(
            [
                f"What revenue or margin detail is explicit in the excerpts for {t}?",
                f"Where does {t} discuss cost drivers in the indexed text?",
                f"What is still unclear about {t}'s results after this answer?",
            ]
        )
    if any(
        k in q
        for k in (
            "ai ",
            " ai",
            "artificial intelligence",
            "machine learning",
            "cloud",
            "google cloud",
            "gcp",
            "investment",
            "capex",
            "research and development",
            "r&d",
        )
    ):
        bank.extend(
            [
                f"What does the indexed 10-K/10-Q text say about {t}'s segment revenue or cloud reporting?",
                f"Where do excerpts mention R&D or capital expenditures for {t}?",
                f"Which risk factors in the excerpts relate to competition or technology for {t}?",
            ]
        )

    if len(bank) < 3:
        bank.extend(
            [
                f"What is the strongest evidence in the excerpts for {t} on this topic?",
                f"What should we pull from the next filing refresh for {t}?",
                f"Which source [1]–[5] is most decisive for {t} here, and why?",
            ]
        )

    seen: set[str] = set()
    unique: list[str] = []
    for item in bank:
        if item not in seen and len(item) <= 140:
            seen.add(item)
            unique.append(item)
        if len(unique) >= 3:
            break
    return unique[:3]
