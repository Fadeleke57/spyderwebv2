from pydantic import BaseModel
from src.db.mongodb import get_collection
from typing import Optional

Feedbacks = get_collection("feedback")


class FeedbackPayload(BaseModel):
    rating: int
    feedbackType: str
    comment: str
    reccomendation: str
    webId: Optional[str] = None
    userId: Optional[str] = None
