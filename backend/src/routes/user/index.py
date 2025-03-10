from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import re
from src.db.mongodb import (
    get_collection,
    get_item_by_id,
    clear_search_history,
)
from src.utils.exceptions import check_user
from src.models.user import User, UpdateUser
from fastapi.exceptions import HTTPException

router = APIRouter()


@router.get("/search/history")
def get_search_history(user: User = Depends(manager)):
    check_user(user)
    user = get_item_by_id("users", user["id"])
    analytics = user["analytics"]
    return {"result": analytics["searches"]}


@router.delete("/search/history")
def delete_search_history(user: User = Depends(manager)):
    check_user(user)

    user = get_item_by_id("users", user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clear_search_history(user["email"])

    return {"result": "Search history deleted"}


@router.get("/")
def get_user(userId: str, userMakingRequest: User = Depends(manager.optional)):
    if userMakingRequest:
        check_user(userMakingRequest)

    requestedUser = get_item_by_id("users", userId)

    if not requestedUser:
        return {"result": None}

    return {"result": requestedUser}


@router.patch("/edit/")
def edit_user(updates: UpdateUser, user: User = Depends(manager)):
    check_user(user)
    users = get_collection("users")

    if updates.username:
        username_exists = users.find_one({"username": updates.username})
        if username_exists and username_exists["id"] != user["id"]:
            raise HTTPException(status_code=400, detail="Username already exists")

    update_data = updates.model_dump(exclude_none=True)
    users.update_one(
        {"id": user["id"]},
        {"$set": update_data},
    )
    if not user:
        print("User was not found after editing")
        raise HTTPException(status_code=404, detail="User not found")

    return {"result": "success"}


@router.patch("/hide/web/{webId}")
def hide_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    Users = get_collection("users")
    Users.update_one({"id": user["id"]}, {"$addToSet": {"websHidden": webId}})
    return {"result": True}


@router.patch("/unhide/web/{webId}")
def unhide_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    Users = get_collection("users")
    Users.update_one({"id": user["id"]}, {"$pull": {"websHidden": webId}})
    return {"result": True}


@router.patch("/save/web/{webId}")
def save_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    Users = get_collection("users")
    Users.update_one({"id": user["id"]}, {"$addToSet": {"websSaved": webId}})
    return {"result": True}


@router.patch("/unsave/web/{webId}")
def unsave_web(webId: str, user: User = Depends(manager)):
    check_user(user)
    Users = get_collection("users")
    Users.update_one({"id": user["id"]}, {"$pull": {"websSaved": webId}})
    return {"result": True}


@router.get("/check/email")
def check_email(email: str):
    users = get_collection("users")
    user = users.find_one({"email": email})
    result = True if user else False
    return {"result": result}
