from src.models.feed import AIContent
from fastapi import APIRouter, Depends, BackgroundTasks
from src.models.user import Contributors
from src.lib.pinecone.index import client as pinecone_client
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from src.routes.auth.utils import manager
from src.models.index import User, Webs, Web, Feeds, AiClientFeedType, Message, Feed
from typing import Optional, Literal
from fastapi import Query
from pydantic import BaseModel
from src.lib.logger.index import logger
from src.utils.context import clean_metadata
from src.service.index import feed_service, embedding_service, chunking_service

router = APIRouter()


@router.get("/health")
def health():
    """
    Check if the API is running.
    """
    return JSONResponse(content={"status": "ok"})


@router.get("/version")
def version():
    """
    Get the version of the API.
    """
    return JSONResponse(content={"version": "1.0.0"})


@router.get("/search/webs")
def search_webs(
    query: str,
    scope: Literal["User.all", "All"] = Query("All", alias="scope"),
    user_making_request: User = Depends(manager.required),
):
    """
    Search for webs based on a query and scope.

    Args:
        query (str): The search query.
        scope (Literal["User.all", "All"]: The scope of the search.
        user_making_request (User): The user making the request.

    Returns:
        JSONResponse: A JSON response containing the search results.
    """
    try:
        filter = {}
        if scope == "User.all":
            filter["userId"] = {"$eq": user_making_request.id}
        elif (
            scope == "All"
        ):  # scope to all public webs (inclusive of the user's public and private webs)
            filter = {
                "$or": [
                    {"visibility": {"$eq": "Public"}},
                    {
                        "$and": [
                            {"visibility": {"$eq": "Private"}},
                            {"userId": {"$eq": user_making_request.id}},
                        ]
                    },
                ]
            }
        results = pinecone_client.run_semantic_search(
            query, namespace="webs", filter=filter, limit=5
        )
        all_metadata = []
        for result in results:
            all_metadata.append(clean_metadata(result))
        return JSONResponse(content={"result": all_metadata})
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail="Error searching webs.")


@router.get("/search/memories")
def search_memories(
    query: str,
    scope: Literal["Web", "User.all"] = Query("User.all", alias="scope"),
    webId: Optional[str] = Query(None, alias="webId"),
    sourceId: Optional[str] = Query(None, alias="sourceId"),
    client_id: Optional[str] = Query(
        None, alias="client_id"
    ),  # Don't do anything with this for now, it will be used to track which clients are making which searches
    user_making_request: User = Depends(manager.required),
):
    """
    Search for memories based on a query and scope.

    Args:
        query (str): The search query.
        scope (Literal["Web", "User.all"]: The scope of the search.
        webId (Optional[str]): The ID of the web to search within.
        sourceId (Optional[str]): The ID of the source to search within.
        client_id (Optional[str]): The ID of the client to search within.
        user_making_request (User): The user making the request.

    Returns:
        JSONResponse: A JSON response containing the search results.
    """
    try:
        logger.info(f"received sourceId: {sourceId}")
        filter = {}

        if scope == "Web":
            if not webId and not sourceId:
                raise HTTPException(
                    status_code=400,
                    detail="Web ID or Source ID is required for scope Web.",
                )
            if webId:
                associated_web = Webs.find_one({"webId": webId})
                if not associated_web:
                    raise HTTPException(status_code=404, detail="Web not found")

                associated_web = Web(**associated_web)
                if (
                    associated_web.visibility == "Private"
                    and associated_web.userId != user_making_request.id
                ):
                    is_contributor = Contributors.find_one(
                        {"webId": webId, "userId": user_making_request.id}
                    )
                    if not is_contributor:
                        logger.info(
                            f"User {user_making_request.id} does not have access to web {webId}. The associated web is {associated_web}."
                        )
                        raise HTTPException(
                            status_code=403,
                            detail="You do not have access to this web.",
                        )
                filter["webId"] = {"$eq": webId}

        elif scope == "User.all":
            filter["userId"] = {"$eq": user_making_request.id}

        if sourceId:
            filter["sourceId"] = {"$eq": sourceId}

        try:
            results = pinecone_client.run_semantic_search(
                query, namespace="sources", filter=filter, limit=5
            )
            return JSONResponse(content={"result": results})
        except Exception as e:
            logger.error(f"Error searching memories: {str(e)}")
            raise HTTPException(status_code=500, detail="Error searching memories.")
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail="Error searching memories.")


class AddMemoryPayload(BaseModel):
    client: AiClientFeedType
    content: AIContent
    clientId: str  # reference to the stytch connected app client id


@router.post("/add/memory")
def add_chat_to_memory(
    payload: AddMemoryPayload,
    background_tasks: BackgroundTasks,
    user_making_request: User = Depends(manager.required),
):
    try:
        client = payload.client.value
        logger.info(f"Received client: {client}")
        chat_feed = Feeds.find_one(
            {"clientId": payload.clientId, "userId": user_making_request.id}
        )
        if not chat_feed:  # start of a new feed
            logger.info(f"No feed found for client: {client}")
            logger.info(f"Creating new feed for client: {client}")
            chat_feed = feed_service.create_feed(
                feed_type=client,
                user_id=user_making_request.id,
                client_id=payload.clientId,
            )
        else:
            logger.info(f"Feed found for client: {client}")
            # if it got to this point, it means the feed is enabled
            chat_feed = Feed(**chat_feed)
            if chat_feed.disabled:
                logger.info(f"Feed is disabled for client..Re-enabling: {client}")
                Feeds.update_one(
                    {"clientId": payload.clientId, "userId": user_making_request.id},
                    {"$set": {"disabled": False}},
                )

        if isinstance(payload.content, str):  # convert lazy string to message
            logger.info(f"Converting lazy string to message for client: {client}")
            content = [Message(role=client, content=payload.content)]
        else:
            content = payload.content

        chunks = chunking_service.chunk_chat_messages(messages=content)
        logger.info(f"Created chunks {chunks} for chat.")
        logger.info(f"Running embedding process for {chat_feed} feed.")
        background_tasks.add_task(
            embedding_service.run_feed_embedding_process, feed=chat_feed, chunks=chunks
        )

        return JSONResponse(content={"result": "Memory added successfully"})
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail="Error adding memory.")
