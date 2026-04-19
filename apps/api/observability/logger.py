from datetime import datetime, timezone


def log_event(
    level: str,
    scope: str,
    message: str,
    context: dict[str, str | int | float] | None = None,
) -> None:
    timestamp = datetime.now(timezone.utc).isoformat()
    print({"timestamp": timestamp, "level": level, "scope": scope, "message": message, "context": context})
