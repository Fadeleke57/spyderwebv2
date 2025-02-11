from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class Source(BaseModel):
    sourceId: str
    bucketId: str
    userId: Optional[str]
    name: Optional[str]
    url: Optional[str]
    content: Optional[str]
    type: str
    size: int
    created: datetime
    updated: datetime

class UpdateSource(BaseModel):
    name: Optional[str] = None
