from fastapi import APIRouter, Depends, HTTPException
from src.routes.auth.utils import manager
from src.models.index import User, Feeds, Feed, PublicFeed
from src.lib.stytch.index import connected_apps_client
from src.lib.logger.index import logger
from pydantic import BaseModel, ConfigDict

router = APIRouter()


class ConnectedApp(BaseModel):
    client_id: str
    client_name: str
    client_description: str
    client_secret: str
    status: str

    model_config = ConfigDict(extra="ignore")


@router.get("/all/{user_id}")
def get_all_feeds(user_id: str, user_making_request: User = Depends(manager.optional)):
    authorized = user_making_request and user_making_request.id == user_id

    query = {"userId": user_id, "disabled": False}
    if not authorized:
        query["visibility"] = {"$ne": "Private"}

    feeds = [
        Feed(**feed) if authorized else PublicFeed(**feed)
        for feed in Feeds.find(query, {"_id": 0})
    ]
    feeds = [feed.model_dump() for feed in feeds]
    logger.info(f"Fetched feeds for user {user_id}: {feeds}")
    return {"result": feeds}


@router.patch("/revoke/client/{client_id}/user/{user_id}")
def revoke_feed_access(
    client_id: str, user_id: str, user_making_request: User = Depends(manager.required)
):
    try:
        authorized = user_making_request and user_making_request.id == user_id
        if not authorized:
            logger.error(
                f"User {user_id} is not authorized to revoke feed access for client id {client_id}"
            )
            raise HTTPException(status_code=403, detail="Unauthorized")

        feed = Feeds.find_one({"clientId": client_id})
        if not feed:
            logger.error(
                f"Feed not found for client id {client_id} and user id {user_id}"
            )
            raise HTTPException(status_code=404, detail="Feed not found")

        feed = Feed(**feed)
        clientId = feed.clientId

        if not clientId:
            logger.error(
                f"Feed client id not found for client id {client_id} and user id {user_id}"
            )
            raise HTTPException(status_code=404, detail="Feed client id not found")

        response = connected_apps_client.revoke_connected_app_access(
            user_id=user_making_request.id, connected_app_id=clientId
        )
        if response:
            result = Feeds.update_one(
                {"clientId": client_id}, {"$set": {"disabled": True}}
            )
            if result.modified_count == 0:
                logger.error(
                    f"Feed not found for client id {client_id} and user id {user_id}"
                )
                raise HTTPException(status_code=404, detail="Feed not found")

        logger.info(
            f"Revoked feed access for client id {client_id} and user id {user_id}"
        )

        return {"result": response}
    except Exception as e:
        logger.error(f"Error revoking feed access: {e}")
        raise HTTPException(status_code=500, detail=f"Error revoking feed access {e}")
