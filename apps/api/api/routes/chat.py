from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from llm.orchestrator import generate_grounded_answer
from memory.persistence import get_chat_history
from schemas.chat import ChatHistoryResponse, ChatQueryRequest

router = APIRouter()


@router.post("/query")
async def query_chat(request: ChatQueryRequest) -> StreamingResponse:
    return StreamingResponse(
        generate_grounded_answer(request),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no"},
    )


@router.get("/{session_id}/history", response_model=list[ChatHistoryResponse])
async def chat_history(session_id: str) -> list[ChatHistoryResponse]:
    return get_chat_history(session_id)
