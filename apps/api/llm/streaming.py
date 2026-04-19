import json


def format_sse(event: str, data: object) -> str:
    payload = json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"
