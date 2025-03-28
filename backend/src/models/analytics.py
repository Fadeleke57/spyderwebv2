from typing import Optional, List, Literal
from typing_extensions import TypedDict
from pydantic import BaseModel
from src.db.mongodb import get_collection

Searches = get_collection("searches")
Analytics = get_collection("analytics")


class SearchFilter(TypedDict):
    visibility: Optional[str] = None
    userId: Optional[str] = None
    webId: Optional[List[str]] = None


class Search(BaseModel):
    query: str
    timestamp: str
    userId: Optional[str] = None
    filter: Optional[SearchFilter] = None


class TokenUsage(BaseModel):
    userId: str
    type: Literal["chat", "connect"]
    timestamp: str
    inputTokenCount: int
    outputTokenCount: int
    tokenCount: int
    description: str
