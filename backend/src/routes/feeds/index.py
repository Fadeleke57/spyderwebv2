from fastapi import APIRouter, Depends
from src.routes.auth.utils import manager
from src.models.index import User, Feeds, Feed, PublicFeed

router = APIRouter()


@router.get("/all/{user_id}")
def get_all_feeds(user_id: str, user_making_request: User = Depends(manager.optional)):
    authorized = user_making_request and user_making_request.id == user_id

    query = {"userId": user_id}
    if not authorized:
        query["visibility"] = {"$ne": "Private"}

    feeds = [
        Feed(**feed) if authorized else PublicFeed(**feed)
        for feed in Feeds.find(query, {"_id": 0})
    ]
    feeds = [feed.model_dump() for feed in feeds]
    return {"result": feeds}
