from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import re
from src.db.mongodb import get_collection, add_search_to_user, get_item_by_id, clear_search_history
from src.utils.graph import split_into_sentences_nltk, highlight_match
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
def get_user(userId: str, user: User = Depends(manager.optional)):
    if user:
        check_user(user)
    user = get_item_by_id("users", userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"result": user}

@router.patch("/edit")
def edit_user(updates: UpdateUser, userToEdit : User = Depends(manager)):
    check_user(userToEdit)
    users = get_collection("users")
    user = users.find_one_and_update({"id": userToEdit["id"]}, {"$set": updates.model_dump()}, return_document=True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"result": user}

"""
@router.post("/save/bucket/{bucketId}")
def save_bucket(bucketId: str, user: User = Depends(manager)):
    check_user(user)
    users = get_collection("users")
    user = users.find_one_and_update({"bucketId": bucketId, "userId": user["id"]}, {"$addToSet": {"bucketsSaved": bucketId}}, return_document=True)
    if not user:
        raise HTTPException(status_code=404, detail="Bucket not found")
    return {"result": }

@router.delete("/unsave/bucket/{bucketId}")
def unsave_bucket(bucketId: str, user: User = Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    bucket = buckets.find_one_and_update({"bucketId": bucketId, "userId": user["id"]}, {"$set": {"saved": False}}, return_document=True)
    if not bucket:
        raise HTTPException(status_code=404, detail="Bucket not found")
    return {"result": bucket}

@router.post("/hide/bucket/{bucketId}")
def hide_bucket(bucketId: str, user: User = Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    bucket = buckets.find_one_and_update({"bucketId": bucketId, "userId": user["id"]}, {"$set": {"hidden": True}}, return_document=True)
    if not bucket:
        raise HTTPException(status_code=404, detail="Bucket not found")
    return {"result": bucket}

@router.delete("/unhide/bucket/{bucketId}")
def unhide_bucket(bucketId: str, user: User = Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    bucket = buckets.find_one_and_update({"bucketId": bucketId, "userId": user["id"]}, {"$set": {"hidden": False}}, return_document=True)
    if not bucket:
        raise HTTPException(status_code=404, detail="Bucket not found")
    return {"result": bucket}
    """