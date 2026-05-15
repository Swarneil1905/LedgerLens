import os
from dataclasses import dataclass
from typing import Literal
from urllib.parse import urlparse, urlunparse


class ConfigError(ValueError):
    """Raised when LLM-related environment configuration is invalid or incomplete."""


LlmProvider = Literal["stub", "ollama", "groq"]


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


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or not str(raw).strip():
        return default
    return float(str(raw).strip())


def _env_positive_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or not str(raw).strip():
        return default
    v = int(str(raw).strip())
    return v if v > 0 else default


def _env_optional_positive_int(name: str) -> int | None:
    raw = os.getenv(name)
    if raw is None or not str(raw).strip():
        return None
    v = int(str(raw).strip())
    return v if v > 0 else None


@dataclass(frozen=True)
class LlmSettings:
    """Runtime LLM behavior (env-driven; defaults keep current stub behavior)."""

    provider: LlmProvider
    ollama_base_url: str
    ollama_model: str
    ollama_chat_temperature: float
    ollama_chat_top_p: float
    ollama_chat_num_predict: int
    ollama_chat_num_ctx: int | None
    groq_api_key: str | None
    groq_model: str


def get_llm_settings() -> LlmSettings:
    raw = os.getenv("LLM_PROVIDER", "stub").strip().lower()
    if raw == "groq":
        provider: LlmProvider = "groq"
    elif raw == "ollama":
        provider = "ollama"
    else:
        provider = "stub"

    base = normalize_ollama_base_url(os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"))
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b").strip() or "llama3.2:3b"

    groq_key = (os.getenv("GROQ_API_KEY") or "").strip() or None
    groq_model = (os.getenv("GROQ_MODEL", "llama-3.1-8b-instant") or "llama-3.1-8b-instant").strip()
    if provider == "groq" and not groq_key:
        raise ConfigError(
            "GROQ_API_KEY is required when LLM_PROVIDER=groq. Get a free key at https://console.groq.com"
        )

    return LlmSettings(
        provider=provider,
        ollama_base_url=base,
        ollama_model=model,
        ollama_chat_temperature=_env_float("OLLAMA_CHAT_TEMPERATURE", 0.3),
        ollama_chat_top_p=_env_float("OLLAMA_CHAT_TOP_P", 0.88),
        ollama_chat_num_predict=_env_positive_int("OLLAMA_CHAT_NUM_PREDICT", 800),
        ollama_chat_num_ctx=_env_optional_positive_int("OLLAMA_NUM_CTX"),
        groq_api_key=groq_key,
        groq_model=groq_model,
    )
