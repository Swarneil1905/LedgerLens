def chunk_text(raw_text: str, chunk_size: int = 500) -> list[str]:
    return [raw_text[index : index + chunk_size] for index in range(0, len(raw_text), chunk_size)]
