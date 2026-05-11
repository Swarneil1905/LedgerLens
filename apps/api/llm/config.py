import os
from dataclasses import dataclass
from typing import Literal
from urllib.parse import urlparse, urlunparse


LlmProvider = Literal["stub", "ollama"]


def normalize_ollama_base_url(raw: str) -> str:
    """Ensure scheme and default Ollama port (11434) so bare hostnames from Railway work."""
    s = (raw or "").strip().rstrip("/")
    if not s:
        return "http://127.0.0.1:11434"
    if "://" not in s:
        s = "http://" + s
    parsed = urlparse(s)
    scheme = (parsed.scheme or "http").lower()
    if not parsed.hostname:
        return "http://127.0.0.1:11434"
    if parsed.port is not None:
        return urlunparse((scheme, parsed.netloc, "", "", "", "")).rstrip("/")
    host = parsed.hostname
    if ":" in host:
        netloc = f"[{host}]:11434"
    else:
        netloc = f"{host}:11434"
    if parsed.username is not None:
        auth = parsed.username
        if parsed.password is not None:
            auth = f"{auth}:{parsed.password}"
        netloc = f"{auth}@{netloc}"
    return urlunparse((scheme, netloc, "", "", "", "")).rstrip("/")


@dataclass(frozen=True)
class LlmSettings:
    """Runtime LLM behavior (env-driven; defaults keep current stub behavior)."""

    provider: LlmProvider
    ollama_base_url: str
    ollama_model: str


def get_llm_settings() -> LlmSettings:
    raw = os.getenv("LLM_PROVIDER", "stub").strip().lower()
    provider: LlmProvider = "ollama" if raw == "ollama" else "stub"
    base = normalize_ollama_base_url(os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"))
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b").strip() or "llama3.2:3b"
    return LlmSettings(provider=provider, ollama_base_url=base, ollama_model=model)
