from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
from src.db.mongodb import get_collection

Sources = get_collection("sources")


class CreateNote(BaseModel):
    title: str
    content: str


class UpdateNote(BaseModel):
    content: Optional[str]


class Source(BaseModel):
    sourceId: str
    webId: str
    userId: str
    name: Optional[str]
    url: Optional[str]
    content: Optional[str]
    type: str
    size: int
    created: datetime
    updated: datetime


class CreateSource(BaseModel):
    webId: str
    name: str
    content: str


class UpdateSource(BaseModel):
    name: Optional[str] = None
