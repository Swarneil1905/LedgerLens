import json
from collections.abc import AsyncIterator

import httpx


async def stream_ollama_chat(
    *,
    base_url: str,
    model: str,
    messages: list[dict[str, str]],
) -> AsyncIterator[str]:
    """Yield assistant text deltas from Ollama's ``/api/chat`` streaming endpoint."""
    url = f"{base_url}/api/chat"
    payload: dict[str, object] = {
        "model": model,
        "messages": messages,
        "stream": True,
        # Grounded answers: lower temperature reduces decorative "outline" hallucinations.
        "options": {"temperature": 0.3, "top_p": 0.88, "num_predict": 1200},
    }
    timeout = httpx.Timeout(120.0, connect=15.0, read=120.0)
    async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
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


async def complete_ollama_chat(
    *,
    base_url: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.45,
    num_predict: int = 320,
) -> str:
    """Single non-streaming completion (e.g. structured follow-up suggestions)."""
    url = f"{base_url}/api/chat"
    payload: dict[str, object] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {"temperature": temperature, "top_p": 0.9, "num_predict": num_predict},
    }
    timeout = httpx.Timeout(60.0, connect=15.0, read=60.0)
    async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data: object = response.json()
    if not isinstance(data, dict):
        return ""
    message = data.get("message")
    if not isinstance(message, dict):
        return ""
    content = message.get("content")
    return content.strip() if isinstance(content, str) else ""
