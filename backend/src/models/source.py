from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class Source(BaseModel):
    sourceId: str
    bucketId: str
    name: Optional[str]
    url: Optional[str]
    type: str
    size: int
    created_at: datetime
    updated_at: datetime