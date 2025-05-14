import re
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from src.routes.auth.oauth2 import manager
from src.lib.logger.index import logger
from src.utils.exceptions import check_user, checkAuthorizedUser
from src.models.index import User, UpdateUser, Users, Webs
from src.constants.credits import PLAN_CREDITS
from src.utils.credits import get_user_credits
from src.utils.storage import STORAGE_LIMITS_MB

router = APIRouter()


@router.get("/search/history")
def get_search_history(user: User = Depends(manager)):
    check_user(user)
    try:
        user = Users.find_one({"id": user["id"]})
        analytics = user["analytics"]
        return {"result": analytics["searches"]}
    except Exception as e:
        logger.error(f"Error getting search history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_user(userId: str, userMakingRequest: User = Depends(manager.optional)):
    if userMakingRequest:
        check_user(userMakingRequest)

    try:
        requestedUser = Users.find_one({"id": userId}, {"_id": 0})

        if not requestedUser:
            return {"result": None}

        publicUser = {
            "id": requestedUser["id"],
            "username": requestedUser["username"],
            "email": requestedUser["email"],
            "bio": requestedUser["bio"],
            "full_name": requestedUser["full_name"],
            "created_at": requestedUser["created_at"],
            "subscription_plan": requestedUser["subscription_plan"],
        }

        return {"result": publicUser}
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/username/{username}")
def get_user_by_username(
    username: str, userMakingRequest: User = Depends(manager.optional)
):
    if userMakingRequest:
        check_user(userMakingRequest)

    try:
        requestedUser = Users.find_one({"username": username}, {"_id": 0})

        if not requestedUser or requestedUser.get("disabled", False):
            return {"result": None}

        publicUser = {
            "id": requestedUser["id"],
            "username": requestedUser["username"],
            "email": requestedUser["email"],
            "bio": requestedUser["bio"],
            "full_name": requestedUser["full_name"],
            "websPinned": requestedUser["websPinned"],
            "websSaved": requestedUser["websSaved"],
            "created_at": requestedUser["created_at"],
            "subscription_plan": requestedUser["subscription_plan"],
        }

        return {"result": publicUser}
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/edit/")
def edit_user(updates: UpdateUser, user: User = Depends(manager)):
    check_user(user)
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
def hide_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        Users.update_one({"id": user["id"]}, {"$addToSet": {"websHidden": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error hiding web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/unhide/web/{webId}")
def unhide_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        Users.update_one({"id": user["id"]}, {"$pull": {"websHidden": webId}})
        return {"result": True}
    except Exception as e:
        logger.error(f"Error unhiding web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/save/web/{webId}")
def save_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        Users.update_one({"id": user["id"]}, {"$addToSet": {"websSaved": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error saving web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/unsave/web/{webId}")
def unsave_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        Users.update_one({"id": user["id"]}, {"$pull": {"websSaved": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error unsaving web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/pin/web/{webId}")
def pin_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        Users.update_one({"id": user["id"]}, {"$addToSet": {"websPinned": webId}})
        return {"result": True}

    except Exception as e:
        logger.error(f"Error pinning web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/unpin/web/{webId}")
def unpin_web(webId: str, user: User = Depends(manager)):
    check_user(user)
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
async def get_usage(user: User = Depends(manager)):
    """Get user's resource usage"""
    check_user(user)
    try:
        user_data = Users.find_one({"id": user["id"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        plan = user_data.get("subscription_plan", "free")
        credits_used = PLAN_CREDITS[plan] - user_data.get("credits", 0)
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
def get_pinned_webs(user_id: str, userMakingRequest: User = Depends(manager.optional)):
    authorized = checkAuthorizedUser(
        resourceUserId=user_id, userMakingRequest=userMakingRequest
    )
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
        check_user(userMakingRequest)
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
