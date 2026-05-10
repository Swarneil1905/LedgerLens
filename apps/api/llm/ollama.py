import json
from collections.abc import AsyncIterator

import httpx


async def stream_ollama_chat(
    *,
    base_url: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
) -> AsyncIterator[str]:
    """Yield assistant text deltas from Ollama's ``/api/chat`` streaming endpoint."""
    url = f"{base_url}/api/chat"
    payload: dict[str, object] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": True,
    }
    timeout = httpx.Timeout(120.0, connect=10.0, read=120.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                try:
                    data: object = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(data, dict):
                    continue
                if data.get("error"):
                    raise RuntimeError(str(data.get("error")))
                if data.get("done") is True:
                    break
                message = data.get("message")
                if not isinstance(message, dict):
                    continue
                content = message.get("content")
                if isinstance(content, str) and content:
                    yield content
