import os
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from src.routes.auth.utils import manager
from src.lib.logger.index import logger
from src.models.index import User, UpdateUser, Users, Webs
from src.constants.credits import PLAN_CREDITS
from src.utils.storage import STORAGE_LIMITS_MB
from pydantic import BaseModel
from src.core.config import settings
from fastapi import File, UploadFile
from src.lib.s3.index import S3Bucket
from werkzeug.utils import secure_filename
from uuid import uuid4
from src.lib.logger.index import logger
from datetime import datetime
from pytz import UTC
from typing import Optional, List, Union

router = APIRouter()
s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)


@router.get("/search/history")
def get_search_history(user: User = Depends(manager.required)):
    try:
        user = Users.find_one({"id": user["id"]})
        analytics = user["analytics"]
        return {"result": analytics["searches"]}
    except Exception as e:
        logger.error(f"Error getting search history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_user(userId: str, _=Depends(manager.optional)):

    try:
        requestedUser = Users.find_one({"id": userId}, {"_id": 0})

        if not requestedUser:
            return {"result": None}

        publicUser = convert_to_public_user(requestedUser, ["subscription_plan"])

        return {"result": publicUser}
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/username/{username}")
def get_user_by_username(username: str, _: User = Depends(manager.optional)):

    try:
        requestedUser = Users.find_one({"username": username}, {"_id": 0})

        if not requestedUser or requestedUser.get("disabled", False):
            return {"result": None}

        publicUser = convert_to_public_user(requestedUser, ["subscription_plan"])

        return {"result": publicUser}
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/edit/")
def edit_user(updates: UpdateUser, user=Depends(manager.required)):

    try:
        if updates.username:
            username_exists = Users.find_one({"username": updates.username})
            if username_exists and username_exists["id"] != user["id"]:
                raise HTTPException(status_code=400, detail="Username already exists")

        update_data = updates.model_dump(exclude_none=True)
        Users.update_one(
            {"id": user["id"]},
            {"$set": update_data},
        )
        if not user:
            print("User was not found after editing")
            raise HTTPException(status_code=404, detail="User not found")

        return {"result": "success"}

    except Exception as e:
        logger.error(f"Error editing user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/hide/web/{webId}")
def hide_web(webId: str, user: User = Depends(manager.required)):

    try:
        Users.update_one({"id": user["id"]}, {"$addToSet": {"websHidden": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error hiding web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/unhide/web/{webId}")
def unhide_web(webId: str, user: User = Depends(manager.required)):

    try:
        Users.update_one({"id": user["id"]}, {"$pull": {"websHidden": webId}})
        return {"result": True}
    except Exception as e:
        logger.error(f"Error unhiding web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/save/web/{webId}")
def save_web(webId: str, user: User = Depends(manager.required)):

    try:
        Users.update_one({"id": user["id"]}, {"$addToSet": {"websSaved": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error saving web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/unsave/web/{webId}")
def unsave_web(webId: str, user: User = Depends(manager.required)):

    try:
        Users.update_one({"id": user["id"]}, {"$pull": {"websSaved": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error unsaving web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/pin/web/{webId}")
def pin_web(webId: str, user: User = Depends(manager.required)):

    try:
        Users.update_one({"id": user["id"]}, {"$addToSet": {"websPinned": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error pinning web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/unpin/web/{webId}")
def unpin_web(webId: str, user: User = Depends(manager.required)):

    try:
        Users.update_one({"id": user["id"]}, {"$pull": {"websPinned": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error unpinning web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check/email")
def check_email(email: str):
    try:
        user = Users.find_one({"email": email})
        result = True if user else False
        return {"result": result}

    except Exception as e:
        logger.error(f"Error checking email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/usage")
async def get_usage(user: User = Depends(manager.required)):
    """Get user's resource usage"""

    try:
        user_data = Users.find_one({"id": user["id"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        plan = user_data.get("subscription_plan", "free")
        credits_used = user_data.get("credits", 0)
        credits_limit = PLAN_CREDITS[plan]

        # Get storage values directly from user_data
        storage_used = user_data.get("storage_used", 0) / (1024**2)
        storage_limit = STORAGE_LIMITS_MB[plan]

        return {
            "storage": {"used": storage_used, "limit": storage_limit},
            "computation": {"used": credits_used, "limit": credits_limit},
        }

    except Exception as e:
        logger.error(f"Error getting usage for user {user['id']}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pinned/webs/{user_id}")
def get_pinned_webs(
    user_id: str, userMakingRequest: Union[User, None] = Depends(manager.optional)
):
    userMakingRequest = User(**userMakingRequest) if userMakingRequest else None
    authorized = userMakingRequest and userMakingRequest.id == user_id
    profile = Users.find_one({"id": user_id})

    query = {"webId": {"$in": profile["websPinned"]}}

    if not authorized:
        query["visibility"] = "Public"

    try:
        profile = Users.find_one({"id": user_id})

        if not profile:
            raise HTTPException(status_code=404, detail="User not found")

        webs = list(Webs.find(query, {"_id": 0}))
        return {"result": webs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.get("/saved/webs/{user_id}")
def get_pinned_webs(user_id: str, userMakingRequest: User = Depends(manager.optional)):
    authorized = False
    if userMakingRequest:
        if userMakingRequest["id"] == user_id:
            authorized = True

    query = {"webId": {"$in": userMakingRequest["websSaved"]}}
    if not authorized:
        query["visibility"] = "Public"

    try:
        profile = Users.find_one({"id": user_id})

        if not profile:
            raise HTTPException(status_code=404, detail="User not found")

        webs = list(Webs.find(query, {"_id": 0}))
        return {"result": webs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


class UploadProfilePictureRequest(BaseModel):
    image: UploadFile


@router.post("/replace/profile/picture")
async def replace_profile_picture(
    file: UploadFile = File(...), user: User = Depends(manager.required)
):

    try:
        file_uuid = str(uuid4())
        filename = secure_filename(file.filename)
        object_name = f"files/{user['id']}/profile/images/{filename}_{file_uuid}"
        temp_dir = "/tmp/profile_image_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"{filename}_{file_uuid}")

        contents = await file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(contents)

        s3_bucket.upload_file(temp_path, object_name)
        os.remove(temp_path)

        url = f"https://{settings.cloudfront_domain}/{object_name}"

        prev_image_keys = user.get("imageKeys", [])
        Users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "imageKeys": prev_image_keys + [object_name],
                    "profile_picture_url": url,
                    "updated_at": datetime.now(UTC),
                },
            },
        )

        return {"result": url}

    except Exception as e:
        logger.error(f"Error replacing profile picture: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


def convert_to_public_user(
    user: User, extra_fields: Optional[List[str]] = None
) -> User:

    publicUser = {
        "id": user["id"],
        "username": user["username"],
        "profile_picture_url": user["profile_picture_url"],
        "bio": user["bio"],
        "full_name": user["full_name"],
        "created_at": user["created_at"],
    }

    if extra_fields:
        for field in extra_fields:
            publicUser[field] = user[field]

    return publicUser
