from pydantic import BaseModel
from typing import Literal, Optional

class Source(BaseModel):
    id: str
    bucketId: str
    name: Optional[str]
    url: Optional[str]
    type: Literal['text', 'image', 'video', 'url']
    created_at: str
    updated_at: str