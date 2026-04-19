from pydantic import BaseModel


class FeedbackEvent(BaseModel):
    message_id: str
    score: int
