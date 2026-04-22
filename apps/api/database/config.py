import os


def database_url() -> str | None:
    raw = os.getenv("DATABASE_URL")
    if not raw or not raw.strip():
        return None
    return raw.strip()


def is_database_configured() -> bool:
    return database_url() is not None
