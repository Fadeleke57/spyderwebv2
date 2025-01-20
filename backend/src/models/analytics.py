from typing import Optional, List
from pydantic import BaseModel

class SearchFilter(BaseModel):
    visibility: Optional[str] = None
    userId: Optional[str] = None
    bucketId: Optional[List[str]] = None

class Search(BaseModel):
    query: str
    timestamp: str
    userId: Optional[str] = None
    filter: Optional[SearchFilter] = None