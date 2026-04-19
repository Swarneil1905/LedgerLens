from datetime import UTC, datetime


def log_event(
    level: str,
    scope: str,
    message: str,
    context: dict[str, str | int | float] | None = None,
) -> None:
    timestamp = datetime.now(UTC).isoformat()
    print({"timestamp": timestamp, "level": level, "scope": scope, "message": message, "context": context})
