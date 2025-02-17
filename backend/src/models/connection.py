from pydantic import BaseModel
from typing import Optional
from typing_extensions import TypedDict
from datetime import datetime
from src.db.mongodb import get_collection

Connections = get_collection("connections")


class ConnectionData(TypedDict):
    description: str


class ConnectionType(BaseModel):
    connectionId: str
    bucketId: str
    data: ConnectionData
    fromSourceId: str
    toSourceId: str
    created: datetime
    updated: datetime


class CreateConnection(BaseModel):
    data: ConnectionData
    fromSourceId: str
    toSourceId: str
    bucketId: str


class UpdateConnection(BaseModel):
    description: Optional[str]
    toSourceId: Optional[str]


class DeleteConnection(BaseModel):
    bucketId: str
