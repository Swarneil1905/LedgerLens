import os
from dataclasses import dataclass
from typing import Literal


LlmProvider = Literal["stub", "ollama"]


@dataclass(frozen=True)
class LlmSettings:
    """Runtime LLM behavior (env-driven; defaults keep current stub behavior)."""

    provider: LlmProvider
    ollama_base_url: str
    ollama_model: str


def get_llm_settings() -> LlmSettings:
    raw = os.getenv("LLM_PROVIDER", "stub").strip().lower()
    provider: LlmProvider = "ollama" if raw == "ollama" else "stub"
    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").strip().rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b").strip() or "llama3.2:3b"
    return LlmSettings(provider=provider, ollama_base_url=base, ollama_model=model)
