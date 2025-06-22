from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from uuid import uuid4
from src.lib.logger.index import logger
from src.db.mongodb import get_collection
from pytz import UTC

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
    likes: list[str] = []
    iteratedFrom: Optional[str] = None
    iterations: list[str] = []
    enableAIConnections: Optional[bool] = True
    showcase: Optional[bool] = False


class CreateWeb(BaseModel):
    name: str
    description: str
    visibility: Literal["Private", "Public", "Invite"]
    tags: list[str] = []
    sourceIds: list[str] = []
    imageKeys: list[str] = []
    enableAIConnections: Optional[bool] = True
    showcase: Optional[bool] = False


def create_web(webToCreate: CreateWeb, userId: str):
    """
    Create a new web in the database.

    Args:
        webToCreate (CreateWeb): A CreateWeb object containing the new web's data.

    Returns:
        str: The ID of the newly created web, or False if an error occurred.
    """
    if not webToCreate or not userId:
        raise ValueError("Web object and user ID is required")

    try:
        webId = str(uuid4())

        web_data = Web(
            userId=userId,
            webId=webId,
            name=webToCreate.name,
            description=webToCreate.description,
            visibility=webToCreate.visibility,
            tags=webToCreate.tags,
            sourceIds=webToCreate.sourceIds,
            imageKeys=webToCreate.imageKeys,
            enableAIConnections=webToCreate.enableAIConnections,
            created=datetime.now(UTC),
            updated=datetime.now(UTC),
            showcase=webToCreate.showcase,
            likes=[],
            iterations=[],
            iteratedFrom=None,
        )

        Webs.insert_one(web_data.model_dump())
        return webId

    except Exception as e:
        logger.error(f"Error creating web: {str(e)}")
        return False


class UpdateWeb(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[Literal["Private", "Public", "Invite"]] = None
    enableAIConnections: Optional[bool] = None


class IterateWeb(BaseModel):
    name: str
    description: str
    withConnections: bool = False


class LikeWeb(BaseModel):
    webId: str


class UnLikeWeb(BaseModel):
    webId: str
