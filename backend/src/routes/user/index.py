from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import re
from src.db.mongodb import get_collection, add_search_to_user, get_item_by_id, clear_search_history
from src.utils.graph import split_into_sentences_nltk, highlight_match
from src.utils.exceptions import check_user
from src.models.user import User
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