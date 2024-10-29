from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import uuid
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.models.article import Article
from src.models.user import User
from src.models.note import Note, CreateNote, UpdateNote

from datetime import datetime
from src.models.bucket import BucketConfig, UpdateBucket
from fastapi.exceptions import HTTPException
from src.utils.graph import get_articles_by_ids
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exception_handlers import request_validation_exception_handler
from pydantic import ValidationError
from pymongo import ReturnDocument

router = APIRouter()

@router.get("/{bucket_id}/{article_id}")
def get_note(bucket_id: str, article_id: str, user=Depends(manager)):
    check_user(user)
    notes = get_collection("notes")
    note = notes.find_one({"bucketId": bucket_id, "articleId": article_id, "userId": user["id"]})
    if not note:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"result": note}

@router.post("/create")
def create_note(bucket_id: str, article_id: str, note: CreateNote, user=Depends(manager)):
    check_user(user)
    notes = get_collection("notes")
    full_note = {
        "note_id": str(uuid.uuid4()),
        "title": "New Note",
        "content": note.content,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "user_id": user["id"],
        "bucket_id": bucket_id,
        "article_id": article_id
    }
    try :
        notes.insert_one(full_note)
        return {"result": "Note created"}
    except ValidationError as e:
        raise HTTPException(status_code=500, detail=e.errors())


@router.patch("/{bucket_id}/{article_id}")
def update_note(bucket_id: str, article_id: str, note: UpdateNote, user=Depends(manager)):
    check_user(user)
    notes = get_collection("notes")
    try:
        notes.update_one({"bucketId": bucket_id, "articleId": article_id, "userId": user["id"]}, {"$set": {"content": note.content, "updated_at": datetime.now()}})
    except ValidationError as e:
        raise HTTPException(status_code=500, detail=e.errors())
    return {"result": "Note updated"}