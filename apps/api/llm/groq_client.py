import asyncio
import json
import logging
import os
from collections.abc import AsyncGenerator

import httpx

logger = logging.getLogger(__name__)


def _groq_chat_completions_url() -> str:
    base = (os.getenv("GROQ_BASE_URL") or "https://api.groq.com/openai/v1").strip().rstrip("/")
    return f"{base}/chat/completions"


def _groq_api_key() -> str:
    return (os.getenv("GROQ_API_KEY") or "").strip()


def _groq_timeout() -> httpx.Timeout:
    read_s = float(os.getenv("GROQ_CHAT_READ_TIMEOUT", "120"))
    connect_s = float(os.getenv("GROQ_STREAM_CONNECT_TIMEOUT", "15"))
    return httpx.Timeout(connect=connect_s, read=read_s, write=120.0, pool=30.0)


def _groq_attempt_timeout() -> httpx.Timeout:
    """Bounded timeout for a single stream attempt (retry loop uses several)."""
    return httpx.Timeout(45.0, connect=10.0, read=45.0, write=60.0, pool=30.0)


async def _iter_sse_deltas(response: httpx.Response) -> AsyncGenerator[str, None]:
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
    url = _groq_chat_completions_url()

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=_groq_attempt_timeout(), trust_env=False) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as response:
                    if response.status_code == 429:
                        raw_ra = response.headers.get("retry-after", "10")
                        try:
                            retry_after = int(str(raw_ra).strip() or "10")
                        except ValueError:
                            retry_after = 10
                        wait = min(retry_after, 20)
                        logger.warning(
                            "Groq rate limit hit, waiting %ss (attempt %d/3)",
                            wait,
                            attempt + 1,
                        )
                        await asyncio.sleep(wait)
                        continue
                    response.raise_for_status()
                    async for token in _iter_sse_deltas(response):
                        yield token
                    return
        except httpx.TimeoutException:
            if attempt == 2:
                raise
            logger.warning("Groq stream timeout (attempt %d/3); retrying in 5s", attempt + 1)
            await asyncio.sleep(5)

    raise RuntimeError("Groq failed after 3 attempts")


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
    url = _groq_chat_completions_url()

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=_groq_attempt_timeout(), trust_env=False) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 429:
                    raw_ra = resp.headers.get("retry-after", "10")
                    try:
                        retry_after = int(str(raw_ra).strip() or "10")
                    except ValueError:
                        retry_after = 10
                    wait = min(retry_after, 20)
                    logger.warning(
                        "Groq rate limit hit (complete), waiting %ss (attempt %d/3)",
                        wait,
                        attempt + 1,
                    )
                    await asyncio.sleep(wait)
                    continue
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
        except httpx.TimeoutException:
            if attempt == 2:
                raise
            logger.warning("Groq complete timeout (attempt %d/3); retrying in 5s", attempt + 1)
            await asyncio.sleep(5)

    raise RuntimeError("Groq failed after 3 attempts")
