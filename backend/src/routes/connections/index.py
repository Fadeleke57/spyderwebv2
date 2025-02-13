from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends
import uuid
from pytz import UTC
from src.utils.exceptions import check_user
from datetime import datetime
from src.models.connection import (
    Connections,
    CreateConnection,
    UpdateConnection,
    ConnectionType,
)
from fastapi.exceptions import HTTPException

router = APIRouter()


@router.get("/all/bucket/{bucket_id}")
def get_all_connections(bucket_id: str, user=Depends(manager)):
    check_user(user)

    bucketConnections = Connections.find({"bucketId": bucket_id}, {"_id": 0})
    return {"result": bucketConnections}


@router.get("/outgoing/{bucket_id}/{source_id}")
def get_outgoing_connections(bucket_id: str, source_id: str, user=Depends(manager)):
    check_user(user)

    connections = Connections.find(
        {"bucketId": bucket_id, "fromSourceId": source_id}, {"_id": 0}
    )
    return {"result": connections or []}


@router.get("/incoming/{bucket_id}/{source_id}")
def get_incoming_connections(bucket_id: str, source_id: str, user=Depends(manager)):
    check_user(user)

    connections = Connections.find(
        {"bucketId": bucket_id, "toSourceId": source_id}, {"_id": 0}
    )
    return {"result": connections or []}


@router.get("/connection/{bucket_id}/{connection_id}")
def get_connection(bucket_id: str, connection_id: str, user=Depends(manager)):
    check_user(user)

    connection = Connections.find_one(
        {"bucketId": bucket_id, "connectionId": connection_id}, {"_id": 0}
    )

    if not connection:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        return {"result": connection}


@router.post("/create/{bucketId}")
def create_connection(config: CreateConnection, user=Depends(manager)):
    check_user(user)

    try:
        connection = {
            "connectionId": str(uuid.uuid4()),
            "fromSourceId": config.fromSourceId,
            "toSourceId": config.toSourceId,
            "data": config.data,
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
        }
        Connections.insert_one(connection)
        return {"result": connection}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/{connection_id}")
def update_connection(
    connection_id: str, config: UpdateConnection, user=Depends(manager)
):
    check_user(user)

    updates = config.model_dump(exclude=None)
    updates["updated"] = datetime.now(UTC)

    try:
        connection = Connections.update_one(
            {"connectionId": connection_id}, {"$set": updates}, return_document=True
        )
        return {"result": connection}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{connection_id}")
def delete_connection(connection_id: str, user=Depends(manager)):
    check_user(user)

    try:
        Connections.delete_one({"connectionId": connection_id})
        return {"result": "Connection deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
