from pydantic import BaseModel
from typing import Literal, Optional

class CreateNote(BaseModel):
    title: str
    content: str

class UpdateNote(BaseModel):
    title: Optional[str]
    content: Optional[str]

class Note(BaseModel):
    note_id: str
    title: str
    content: str
    created_at: str
    updated_at: str
    user_id: str
    source_id: str