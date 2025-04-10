from pydantic import BaseModel
from typing import Optional
from typing_extensions import TypedDict
from datetime import datetime


class Connection(BaseModel):
    connectionId: str
    webId: str
    description: str
    fromSourceId: str
    toSourceId: str
    created: datetime
    updated: datetime
    aiGenerated: Optional[bool] = False


class CreateConnection(BaseModel):
    description: str
    fromSourceId: str
    toSourceId: str
    webId: str


class UpdateConnection(BaseModel):
    description: Optional[str]
    toSourceId: Optional[str]


class DeleteConnection(BaseModel):
    webId: str
