import asyncio
from collections.abc import AsyncGenerator

from llm.streaming import format_sse
from retrieval.assembler import assemble_context
from schemas.chat import ChatQueryRequest


async def generate_grounded_answer(request: ChatQueryRequest) -> AsyncGenerator[str, None]:
    context = await assemble_context(request.question, request.ticker)
    answer = (
        f"{request.ticker} shows a stable near-term setup in the initial scaffold. "
        "The latest filing tone, macro backdrop, and supporting news items are aligned, "
        "but this answer is still powered by placeholder retrieval data."
    )
    for token in answer.split(" "):
        yield format_sse("text", {"chunk": f"{token} "})
        await asyncio.sleep(0.01)
    yield format_sse("sources", {"sources": context.sources})
    yield format_sse(
        "followups",
        {
            "followUps": [
                "Which filing section changed most?",
                "What external news confirms the trend?",
                "Which macro variables could break the thesis?",
            ]
        },
    )
    yield format_sse("done", {"status": "complete"})
