import json
import os
from collections.abc import AsyncGenerator

import httpx


def _groq_chat_completions_url() -> str:
    base = (os.getenv("GROQ_BASE_URL") or "https://api.groq.com/openai/v1").strip().rstrip("/")
    return f"{base}/chat/completions"


def _groq_api_key() -> str:
    return (os.getenv("GROQ_API_KEY") or "").strip()


def _groq_timeout() -> httpx.Timeout:
    read_s = float(os.getenv("GROQ_CHAT_READ_TIMEOUT", "120"))
    connect_s = float(os.getenv("GROQ_STREAM_CONNECT_TIMEOUT", "15"))
    return httpx.Timeout(connect=connect_s, read=read_s, write=120.0, pool=30.0)


async def stream_groq_chat(
    messages: list[dict[str, str]],
    model: str,
    temperature: float,
    max_tokens: int,
) -> AsyncGenerator[str, None]:
    """Stream assistant text deltas from Groq's OpenAI-compatible chat completions API."""
    api_key = _groq_api_key()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")
    payload: dict[str, object] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    timeout = _groq_timeout()
    async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
        async with client.stream(
            "POST",
            _groq_chat_completions_url(),
            json=payload,
            headers=headers,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                stripped = line.strip()
                if not stripped.startswith("data:"):
                    continue
                data = stripped[5:].lstrip()
                if data == "[DONE]":
                    return
                try:
                    obj: object = json.loads(data)
                except json.JSONDecodeError:
                    continue
                if not isinstance(obj, dict):
                    continue
                err = obj.get("error")
                if err is not None:
                    raise RuntimeError(str(err))
                choices = obj.get("choices")
                if not isinstance(choices, list) or not choices:
                    continue
                first = choices[0]
                if not isinstance(first, dict):
                    continue
                delta = first.get("delta")
                if not isinstance(delta, dict):
                    continue
                content = delta.get("content")
                if isinstance(content, str) and content:
                    yield content


async def complete_groq_chat(
    messages: list[dict[str, str]],
    model: str,
    temperature: float,
    max_tokens: int,
) -> str:
    """Non-streaming chat completion; returns assistant message content."""
    api_key = _groq_api_key()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")
    payload: dict[str, object] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    timeout = _groq_timeout()
    async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
        resp = await client.post(
            _groq_chat_completions_url(),
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        obj: object = resp.json()
    if not isinstance(obj, dict):
        return ""
    err = obj.get("error")
    if err is not None:
        raise RuntimeError(str(err))
    choices = obj.get("choices")
    if not isinstance(choices, list) or not choices:
        return ""
    first = choices[0]
    if not isinstance(first, dict):
        return ""
    message = first.get("message")
    if not isinstance(message, dict):
        return ""
    content = message.get("content")
    return content.strip() if isinstance(content, str) else ""
