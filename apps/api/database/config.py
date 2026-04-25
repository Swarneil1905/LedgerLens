import os


def database_url() -> str | None:
    raw = os.getenv("DATABASE_URL")
    if not raw or not raw.strip():
        return None
    url = raw.strip()
    # SQLAlchemy defaults to psycopg2 for "postgresql://". This project uses psycopg3.
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    return url


def is_database_configured() -> bool:
    return database_url() is not None
