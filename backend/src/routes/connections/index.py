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
from src.db.neo4j import client as neo4jClient
from fastapi.exceptions import HTTPException
from src.lib.logger.index import logger

router = APIRouter()


@router.get("/all/bucket/{bucket_id}")
def get_all_connections(bucket_id: str):
    bucketConnections = neo4jClient.get_all_connections_for_web("connection", bucket_id)
    return {"result": bucketConnections}


@router.get("/outgoing/{bucket_id}/{source_id}")
def get_outgoing_connections(bucket_id: str, source_id: str):
    outgoing_connections = neo4jClient.get_outgoing_connections_for_source(
        "connection", source_id
    )
    return {"result": outgoing_connections}


@router.get("/incoming/{bucket_id}/{source_id}")
def get_incoming_connections(bucket_id: str, source_id: str):
    incomingConnections = neo4jClient.get_incoming_connections_for_source(
        "connection", source_id
    )
    return {"result": incomingConnections}


@router.get("/connection/{bucket_id}/{connection_id}")
def get_connection(bucket_id: str, connection_id: str):

    connection = neo4jClient.get_connection_by_id("connection", connection_id)

    if not connection:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        return {"result": connection}


@router.post("/create")
def create_connection(connection_data: CreateConnection, user=Depends(manager)):
    check_user(user)

    try:
        connection = {
            "connectionId": str(uuid.uuid4()),
            "fromSourceId": connection_data.fromSourceId,
            "toSourceId": connection_data.toSourceId,
            "bucketId": connection_data.bucketId,
            "data.description": connection_data.data.get("description"),
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
        }
        Connections.insert_one(connection.copy())
        neo4jClient.create_connection_between_sources(
            connection_data.fromSourceId, connection_data.toSourceId, connection
        )

        return {"result": connection}
    except Exception as e:
        logger.info(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/{connection_id}")
def update_connection(
    connection_id: str, config: UpdateConnection, user=Depends(manager)
):
    check_user(user)
    pass


@router.delete("/delete/{connection_id}")
def delete_connection(connection_id: str, user=Depends(manager)):
    check_user(user)

    try:
        neo4jClient.delete_connection(connection_id, "connection")
        return {"result": "Connection deleted"}
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))
