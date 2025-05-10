import uuid
from pytz import UTC
from datetime import datetime
from fastapi import APIRouter, Depends
from src.lib.logger.index import logger
from fastapi.exceptions import HTTPException
from src.models.index import FeedbackPayload, Feedbacks

router = APIRouter()


@router.post("/")
async def feedback(feedbackPayload: FeedbackPayload):
    toInsert = feedbackPayload.model_dump()
    toInsert["feedbackId"] = str(uuid.uuid4())
    toInsert["created"] = datetime.now(UTC)

    try:
        Feedbacks.insert_one(toInsert)
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

    return {"result": True}
