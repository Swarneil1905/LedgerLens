from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from llm.config import get_llm_settings
from llm.orchestrator import generate_grounded_answer
from memory.persistence import get_chat_history
from schemas.chat import ChatHistoryResponse, ChatQueryRequest

router = APIRouter()


@router.post("/query")
async def query_chat(request: ChatQueryRequest) -> StreamingResponse:
    llm = get_llm_settings()
    headers: dict[str, str] = {
        "X-Accel-Buffering": "no",
        "X-LedgerLens-LLM-Provider": llm.provider,
    }
    if llm.provider == "ollama":
        headers["X-LedgerLens-Ollama-Model"] = llm.ollama_model
    if llm.provider == "groq":
        headers["X-LedgerLens-Groq-Model"] = llm.groq_model
    return StreamingResponse(
        generate_grounded_answer(request),
        media_type="text/event-stream",
        headers=headers,
    )


@router.get("/{session_id}/history", response_model=list[ChatHistoryResponse])
async def chat_history(session_id: str) -> list[ChatHistoryResponse]:
    return get_chat_history(session_id)
