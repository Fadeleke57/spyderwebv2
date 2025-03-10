from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
from src.db.mongodb import get_collection

Sources = get_collection("sources")


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


class UpdateSource(BaseModel):
    name: Optional[str] = None
