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


class WebConfig(BaseModel):
    name: str
    description: str
    visibility: Literal["Private", "Public", "Invite"]
    tags: list[str] = []
    sourceIds: list[str] = []
    imageKeys: list[str] = []


class UpdateWeb(BaseModel):
    name: Optional[str]
    description: Optional[str]
    visibility: Literal["Private", "Public", "Invite"]


class IterateWeb(BaseModel):
    name: str
    description: str
    withConnections: bool


class LikeWeb(BaseModel):
    webId: str


class UnLikeWeb(BaseModel):
    webId: str
