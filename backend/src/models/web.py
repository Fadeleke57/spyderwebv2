from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from src.db.mongodb import get_collection

Webs = get_collection("webs")


class Web(BaseModel):
    webId: str
    userId: str
    name: str
    description: str
    tags: list[str]
    sourceIds: list[str]
    imageKeys: list[str]
    created: datetime
    updated: datetime
    visibility: Literal["Private", "Public", "Invite"]
    likes: list[str]
    iteratedFrom: Optional[str]  # userId
    iterations: list[str]
    imageKeys: Optional[list[str]]
    enableAIConnections: Optional[bool]


class CreateWeb(BaseModel):
    name: str
    description: str
    visibility: Literal["Private", "Public", "Invite"]
    tags: list[str] = []
    sourceIds: list[str] = []
    imageKeys: list[str] = []
    enableAIConnections: Optional[bool] = True


class UpdateWeb(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[Literal["Private", "Public", "Invite"]] = None
    enableAIConnections: Optional[bool] = None


class IterateWeb(BaseModel):
    name: str
    description: str
    withConnections: bool


class LikeWeb(BaseModel):
    webId: str


class UnLikeWeb(BaseModel):
    webId: str
