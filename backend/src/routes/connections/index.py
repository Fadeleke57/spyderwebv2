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


@router.get("/all/web/{web_id}")
def get_all_connections(web_id: str):
    try:
        webConnections = neo4jClient.get_all_connections_for_web("connection", web_id)
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

    return {"result": webConnections}


@router.get("/outgoing/{web_id}/{source_id}")
def get_outgoing_connections(web_id: str, source_id: str):
    try:
        outgoing_connections = neo4jClient.get_outgoing_connections_for_source(
            "connection", source_id
        )
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

    return {"result": outgoing_connections}


@router.get("/incoming/{web_id}/{source_id}")
def get_incoming_connections(web_id: str, source_id: str):
    try:
        incomingConnections = neo4jClient.get_incoming_connections_for_source(
            "connection", source_id
        )
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))
    return {"result": incomingConnections}


@router.get("/connection/{web_id}/{connection_id}")
def get_connection(web_id: str, connection_id: str):
    try:
        connection = neo4jClient.get_connection_by_id("connection", connection_id)
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

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
            "webId": connection_data.webId,
            "data.description": connection_data.data.get("description"),
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
        }
        try:
            neo4jClient.create_connection_between_sources(
                connection_data.fromSourceId, connection_data.toSourceId, connection
            )
        except Exception as e:
            logger.error(str(e))
            raise HTTPException(status_code=500, detail=str(e))

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
