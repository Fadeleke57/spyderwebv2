from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from src.db.mongodb import get_collection

Searches = get_collection("searches")


class SearchFilter(TypedDict):
    visibility: Optional[str] = None
    userId: Optional[str] = None
    webId: Optional[List[str]] = None


class Search(BaseModel):
    query: str
    timestamp: str
    userId: Optional[str] = None
    filter: Optional[SearchFilter] = None
