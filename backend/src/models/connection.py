from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from src.db.mongodb import get_collection

Connections = get_collection("connections")


class ConnectionData(BaseModel):
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


class UpdateConnection(BaseModel):
    description: Optional[str]
    toSourceId: Optional[str]


class DeleteConnection(BaseModel):
    bucketId: str
