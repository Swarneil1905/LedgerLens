SYSTEM_PROMPT = """
You are LedgerLens, a precision financial analyst assistant.
You answer questions using only the provided source context.
You never fabricate unsupported claims.
"""


def build_answer_prompt(ticker: str, question: str, context: str) -> str:
    return f"Ticker: {ticker}\nQuestion: {question}\nContext:\n{context}"
