from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import uuid
from src.db.mongodb import get_collection
from src.utils.exceptions import check_user
from src.models.note import Note, CreateNote, UpdateNote
from pytz import UTC
from datetime import datetime
from fastapi.exceptions import HTTPException
from pydantic import ValidationError

router = APIRouter()

@router.get("/{bucket_id}/{source_id}")
def get_note(bucket_id: str, article_id: str, user=Depends(manager)):
    """
    Retrieve a note associated with a given bucket and article.

    Args:
        bucket_id (str): The ID of the bucket.
        article_id (str): The ID of the article.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the note data if found.

    Raises:
        HTTPException: If the note is not found, raises a 404 error.
    """
    check_user(user)
    notes = get_collection("notes")
    note = notes.find_one({"bucketId": bucket_id, "articleId": article_id, "userId": user["id"]})
    if not note:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"result": note}

@router.post("/create")
def create_note(bucket_id: str, article_id: str, note: CreateNote, user=Depends(manager)):
    """
    Create a new note for a given bucket and article.

    Args:
        bucket_id (str): The ID of the bucket the note belongs to.
        article_id (str): The ID of the article the note belongs to.
        note (CreateNote): The content for the new note.
        user (User): The user making the request.

    Raises:
        HTTPException: If there is an error while creating the note (500)
                      or if the note is not created (404)

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)
    notes = get_collection("notes")
    full_note = {
        "note_id": str(uuid.uuid4()),
        "title": "New Note",
        "content": note.content,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
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
    """
    Update a note.

    Args:
        bucket_id (str): The ID of the bucket the note belongs to.
        article_id (str): The ID of the article the note belongs to.
        note (UpdateNote): The new content for the note.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)
    notes = get_collection("notes")
    try:
        notes.update_one({"bucketId": bucket_id, "articleId": article_id, "userId": user["id"]}, {"$set": {"content": note.content, "updated_at": datetime.now(UTC)}})
    except ValidationError as e:
        raise HTTPException(status_code=500, detail=e.errors())
    return {"result": "Note updated"}