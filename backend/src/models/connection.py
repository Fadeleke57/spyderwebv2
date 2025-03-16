from pydantic import BaseModel
from typing import Optional
from typing_extensions import TypedDict
from datetime import datetime
from src.db.mongodb import get_collection

Connections = get_collection("connections")


class ConnectionData(TypedDict):
    description: str


class Connection(BaseModel):
    connectionId: str
    webId: str
    data: ConnectionData
    fromSourceId: str
    toSourceId: str
    created: datetime
    updated: datetime


class CreateConnection(BaseModel):
    data: ConnectionData
    fromSourceId: str
    toSourceId: str
    webId: str


class UpdateConnection(BaseModel):
    description: Optional[str]
    toSourceId: Optional[str]


class DeleteConnection(BaseModel):
    webId: str
