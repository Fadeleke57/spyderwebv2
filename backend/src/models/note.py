from pydantic import BaseModel
from typing import Literal

class CreateNote(BaseModel):
    content: str
    bucket_id: str
    source_id: str

class UpdateNote(BaseModel):
    content: str
    bucket_id: str
    source_id: str

class Note(BaseModel):
    note_id: str
    title: str
    content: str
    created_at: str
    updated_at: str
    user_id: str
    source_id: str