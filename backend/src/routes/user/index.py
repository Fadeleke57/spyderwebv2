import re
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from src.routes.auth.oauth2 import manager
from src.lib.logger.index import logger
from src.utils.exceptions import check_user
from src.models.user import User, UpdateUser, Users

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

        return {"result": requestedUser}
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


@router.get("/check/email")
def check_email(email: str):
    try:
        user = Users.find_one({"email": email})
        result = True if user else False
        return {"result": result}

    except Exception as e:
        logger.error(f"Error checking email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
