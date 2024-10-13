from pydantic import BaseModel
from typing import Literal

class CreateNote(BaseModel):
    type: str
    content: str
    user_id: str
    bucket_id: str

class UpdateNote(BaseModel):
    type: str
    content: str
    user_id: str
    bucket_id: str

class Note(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str
    user_id: str
    bucket_id: str
    type: Literal['text', 'image', 'video']