# API V1
# These endpoints will be publically available for API and MCP USAGE
from fastapi import APIRouter, Depends
from src.lib.pinecone.index import client as pineconeClient
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from src.routes.auth.utils import manager
from src.models.index import User, Webs
from typing import Optional, Literal, List
from fastapi import Query
from src.lib.logger.index import logger
from src.utils.context import clean_metadata

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


@router.get(
    "/search/webs"
)  # scope to all public webs (inclusive of the user's public and private webs) or all of the user's webs (inclusive of the user's public and private webs)
def search_webs(
    query: str,
    scope: Literal["User.all", "All"] = Query("All", alias="scope"),
    userMakingRequest=Depends(manager.required),
):

    userMakingRequest = User(**userMakingRequest)
    filter = {}
    if scope == "User.all":
        filter["userId"] = {"$eq": userMakingRequest.id}
    elif scope == "All":
        filter = {
            "$or": [
                {"visibility": {"$eq": "Public"}},
                {
                    "$and": [
                        {"visibility": {"$eq": "Private"}},
                        {"userId": {"$eq": userMakingRequest.id}},
                    ]
                },
            ]
        }
    results = pineconeClient.run_semantic_web_search(query, filter=filter, limit=5)
    all_metadata = []
    for result in results:
        all_metadata.append(clean_metadata(result))
    return JSONResponse(content={"result": all_metadata})


@router.get("/search/memories")
def search_memories(
    query: str,
    scope: Literal["Web", "User.all"] = Query("User.all", alias="scope"),
    webId: Optional[str] = Query(None, alias="webId"),
    sourceId: Optional[str] = Query(None, alias="sourceId"),
    userMakingRequest=Depends(manager.required),
):
    logger.info(f"received sourceId: {sourceId}")
    userMakingRequest = User(**userMakingRequest)
    filter = {}

    if scope == "Web":
        if not webId and not sourceId:
            raise HTTPException(
                status_code=400, detail="Web ID or Source ID is required for scope Web."
            )

        if webId:
            associatedWeb = Webs.find_one({"webId": webId})
            if not associatedWeb or (
                associatedWeb
                and associatedWeb["visibility"] == "Private"
                and associatedWeb["userId"] != userMakingRequest.id
            ):
                logger.info(
                    f"User {userMakingRequest.id} does not have access to web {webId}. The associated web is {associatedWeb}."
                )
                raise HTTPException(
                    status_code=403, detail="You do not have access to this web."
                )

            filter["webId"] = {"$eq": webId}

    elif scope == "User.all":
        filter["userId"] = {"$eq": userMakingRequest.id}

    if sourceId:
        filter["sourceId"] = {"$eq": sourceId}

    try:
        results = pineconeClient.run_semantic_source_search(
            query, filter=filter, limit=5
        )
        return JSONResponse(content={"result": results})
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/add/memory")  # TODO: This would be the start of "feeds"
def add_chat_to_memory(
    userMakingRequest=Depends(manager.required),
):
    userMakingRequest = User(**userMakingRequest)
    pass
