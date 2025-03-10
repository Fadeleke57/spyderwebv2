from fastapi import APIRouter, Depends, UploadFile, File
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends, Query
from typing import Optional, Literal
import os
from werkzeug.utils import secure_filename
import uuid
from src.lib.s3.index import S3Bucket
from pytz import UTC
from src.utils.exceptions import check_user
from src.utils.search import run_semantic_search
from src.models.user import User, Users
from src.db.neo4j import client as neo4jClient
from src.models.analytics import Search, Searches
from src.models.source import Sources, Source
from datetime import datetime
from src.models.web import Webs, WebConfig, UpdateWeb, IterateWeb
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from src.lib.logger.index import logger
from pymongo import ReturnDocument
from typing import List
from src.core.config import settings
import boto3
from src.lib.pinecone.index import PCINDEX, PC, generate_web_embeddings

router = APIRouter()

s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3 = boto3.client("s3")


@router.get("/all/user")
def get_user_webs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    criteria: Optional[str] = None,
    user: User = Depends(manager),
):
    """
    Retrieve paginated webs belonging to a user, sorted by creation date in descending order,
    with an optional limit on the total number of webs.

    Args:
        page (int): The current page number.
        page_size (int): The number of items per page.
        limit (int, optional): Maximum number of webs to fetch.
        user (User): The user whose webs are to be retrieved.

    Returns:
        dict: A JSON response containing the paginated list of webs and pagination metadata.
    """
    check_user(user)

    try:

        if criteria:
            if criteria == "public":
                visibility = "Public"
            elif criteria == "private":
                visibility = "Private"
            else:
                visibility = None
        else:
            visibility = None

        if visibility:
            webs = list(
                Webs.find({"visibility": visibility, "userId": user["id"]}, {"_id": 0})
            )
        else:
            webs = list(
                Webs.find({"userId": user["id"]}, {"_id": 0}, sort=[("updated", -1)])
            )

        # pagination
        total_webs = len(webs)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_webs = webs[start_index:end_index]

        next_cursor = page + 1 if end_index < total_webs else None
        prev_cursor = page - 1 if page > 1 else None

        return {
            "items": paginated_webs,
            "total": total_webs,
            "page": page,
            "page_size": page_size,
            "nextCursor": next_cursor,
            "prevCursor": prev_cursor,
        }

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.get("/all/public")
async def get_public_webs(limit: int = 20, cursor: str = None):
    """
    Retrieve public webs with cursor-based pagination.

    Parameters
    ----------
    limit : int
        Number of webs to return per page
    cursor : str
        Timestamp-based cursor for pagination

    Returns
    -------
    dict
        Dictionary containing webs and next cursor
    """
    query = {"visibility": "Public"}

    if cursor:
        query["updated"] = {"$lt": datetime.fromisoformat(cursor)}

    webs_list = list(Webs.find(query, {"_id": 0}).sort("updated", -1).limit(limit + 1))

    has_next_page = len(webs_list) > limit
    next_cursor = None

    if has_next_page:
        webs_list = webs_list[:-1]
        next_cursor = webs_list[-1]["updated"]

    return {"result": webs_list, "nextCursor": next_cursor}


@router.get("/popular")
def get_popular_webs(limit: int = 10):
    """
    Retrieve popular webs with cursor-based pagination.

    Parameters
    ----------
    limit : int
        Number of webs to return per page

    Returns
    -------
    dict
        Dictionary containing webs and next cursor
    """
    pipeline = [
        {"$addFields": {"likesCount": {"$size": "$likes"}}},
        {"$sort": {"likesCount": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "likesCount": 0}},
    ]
    top_webs = list(Webs.aggregate(pipeline))
    return {"result": top_webs}


@router.get("/liked/user")  # get all liked webs belonging to a user
def get_user_liked_webs(user: User = Depends(manager)):
    """
    Retrieve all webs liked by a user.

    Args:
        user (User): The user whose liked webs are to be retrieved.

    Returns:
        dict: A JSON response containing a list of liked webs sorted by creation date in descending order.
    """
    check_user(user)
    likedWebs = Webs.find({"likes": user["id"]}, {"_id": 0}, sort=[("created", -1)])
    return {"result": likedWebs}


@router.post("/create")
def create_web(config: WebConfig, user=Depends(manager)):
    """
    Create a new web.

    Args:
        config (WebConfig): The configuration for the new web.
        user (User): The user creating the web.

    Returns:
        dict: A JSON response with a result key containing the ID of the new web.
    """
    check_user(user)
    try:
        webId = str(uuid.uuid4())
        web_to_insert = {
            "webId": webId,
            "name": config.name,
            "description": config.description,
            "userId": user["id"],
            "sourceIds": config.sourceIds or [],
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
            "visibility": config.visibility,
            "tags": config.tags or [],
            "likes": [],
            "iterations": [],
            "imageKeys": [],
        }

        # pinecone pipeline
        vectors = generate_web_embeddings(config.name, config.description)
        pincone_insert = (
            web_to_insert.copy()
        )  # create copy so we don't modify the original
        pincone_insert["created"] = str(
            web_to_insert["created"]
        )  # data object not allowed in pinecone
        pincone_insert["updated"] = str(web_to_insert["updated"])
        embedding_data = [(webId, vectors, pincone_insert)]
        PCINDEX.upsert(
            vectors=embedding_data,
            namespace="webs",
        )

        # mongo insert
        Webs.insert_one(web_to_insert)
        return {"result": webId}

    except Exception as e:
        logger.error(f"Error creating web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/image/{web_id}")
async def upload_file(
    web_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user=Depends(manager),
):

    check_user(user)
    uploaded_image_urls = []

    try:
        for file in files:
            # sanitize filename
            safe_filename = secure_filename(file.filename)
            object_name = f"files/{user['id']}/{web_id}/images/{safe_filename}"

            temp_dir = "/tmp/web_uploads"
            os.makedirs(temp_dir, exist_ok=True)

            temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{safe_filename}")

            try:
                contents = await file.read()
                with open(temp_path, "wb") as buffer:
                    buffer.write(contents)

                s3_bucket.upload_file(
                    temp_path,
                    object_name,
                )

                url = f"https://{s3_bucket.bucket_name}.s3.{s3_bucket.region_name}.amazonaws.com/{object_name}"
                uploaded_image_urls.append(url)

                result = Webs.update_one(
                    {"webId": web_id, "userId": user["id"]},
                    {
                        "$push": {"imageKeys": object_name},
                        "$set": {"updated": datetime.now(UTC)},
                    },
                )

                if result.modified_count == 0:
                    raise HTTPException(status_code=404, detail="Web not found")

            except Exception as e:
                logger.error(f"Error uploading file {safe_filename}: {str(e)}")
                raise HTTPException(
                    status_code=500, detail=f"Error uploading file: {str(e)}"
                )
            finally:
                # clean up
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        return {"imageUrls": uploaded_image_urls}

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/image/{web_id}/{image_name}")
def delete_image(web_id: str, image_name: str, user=Depends(manager)):
    check_user(user)

    filepath = f"files/{user['id']}/{web_id}/images/{image_name}"

    result = Webs.update_one(
        {"webId": web_id, "userId": user["id"], "imageKeys": filepath},
        {"$pull": {"imageKeys": filepath}, "$set": {"updated": datetime.now(UTC)}},
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Web not found")

    s3.delete_object(Web=s3_bucket.bucket_name, Key=filepath)
    return {"result": "Image deleted"}


@router.get("/images/web/{web_id}")
def get_web_images(web_id: str):
    """
    Retrieve all image URLs associated with a given web.

    Args:
        web_id (str): The ID of the web to retrieve images for.

    Returns:
        dict: A JSON response containing a list of image URLs.

    Raises:
        HTTPException: If the web is not found, raises a 404 error.
        HTTPException: If there is an error while generating URLs, raises a 500 error.
    """

    web = Webs.find_one({"webId": web_id})
    if not web:
        raise HTTPException(status_code=404, detail=f"Web not found!")

    imageKeys = web.get("imageKeys", [])
    urls = []
    try:
        for key in imageKeys:
            url = f"https://{settings.cloudfront_domain}/{key}"
            urls.append(url)
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
    logger.info(f"Urls generated {urls}")
    return {"result": urls}


@router.delete("/delete")
def delete_web(webId: str, user=Depends(manager)):
    """
    Delete a web.

    Args:
        webId (str): The ID of the web to delete.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.

    Raises:
        HTTPException: If the web is not found or the user is not the owner of the web.

    """
    check_user(user)
    Webs.delete_one({"webId": webId, "userId": user["id"]})

    PCINDEX.delete(ids=[webId], namespace="webs")

    sourcesForWeb = Sources.find({"webId": webId})
    for source in sourcesForWeb:
        if source["type"] == "document":
            s3.delete_object(Web=s3_bucket.bucket_name, Key=source["url"])
        neo4jClient.delete_source(source["sourceId"])

    return {"result": "Web deleted"}


@router.patch("/update/{webId}")
def update_web(webId: str, config: UpdateWeb, user=Depends(manager)):
    """
    Update a web.

    Args:
        webId (str): The ID of the web to update.
        config (UpdateWeb): The new configuration for the web.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)
    web = Webs.find_one({"webId": webId, "userId": user["id"]})
    if not web:
        raise HTTPException(status_code=404, detail="Web not found")

    update_fields = config.model_dump()
    update_fields["updated"] = datetime.now(UTC)

    vector_updates = {}
    if "name" in update_fields:
        vector_updates["name"] = update_fields["name"]
    if "description" in update_fields:
        vector_updates["description"] = update_fields["description"]

    if vector_updates:
        vectors = generate_web_embeddings(
            vector_updates["name"], vector_updates["description"]
        )
        PCINDEX.update(
            id=webId,
            values=vectors,
            set_metadata=update_fields,
            namespace="webs",
        )

    result = Webs.update_one(
        {"webId": webId, "userId": user["id"]}, {"$set": update_fields}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Web not found or no changes applied"
        )

    return {"result": "Web updated"}


@router.get("/id")
def get_web_by_id(webId: str, user=Depends(manager.optional)):
    """
    Retrieve a web by its ID.

    Args:
        webId (str): The ID of the web to retrieve.
        user (Optional[User]): The user making the request. Defaults to None.

    Returns:
        dict: A JSON response containing the web data if found.

    Raises:
        HTTPException: If the web is not found, raises a 404 error.
    """
    if user:
        check_user(user)

    web = Webs.find_one({"webId": webId}, {"_id": 0})

    if not web:
        raise HTTPException(status_code=404, detail="Item not found")
    elif web["visibility"] == "Private" and user.get("id", "") != web["userId"]:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        return {"result": web}


@router.post("/like/{web_id}")
def like_web(web_id: str, user=Depends(manager)):
    """
    Like a web for a user.

    Args:
        web_id (str): The ID of the web to like.
        user (User): The user making the request.

    Raises:
        HTTPException: If the web is already liked or not found.

    Returns:
        dict: A JSON response with the updated number of likes for the web.
    """
    check_user(user)

    result = Webs.find_one_and_update(
        {"webId": web_id, "likes": {"$ne": user["id"]}},
        {"$addToSet": {"likes": user["id"]}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Already liked or web not found")
    return {"result": len(result["likes"])}


@router.post("/unlike/{web_id}")
def unlike_web(web_id: str, user=Depends(manager)):
    """
    Unlike a web for a user.

    Args:
        web_id (str): The ID of the web to unlike.
        user (User): The user making the request.

    Raises:
        HTTPException: If the web is not liked yet or not found.

    Returns:
        dict: A JSON response with the updated number of likes for the web.
    """
    check_user(user)

    result = Webs.find_one_and_update(
        {"webId": web_id, "likes": user["id"]},
        {"$pull": {"likes": user["id"]}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Not liked yet or web not found")
    return {"result": len(result["likes"])}


@router.get("/saved/user")
def get_user_saved_webs(user=Depends(manager)):
    check_user(user)
    result = Webs.find_one({"webId": {"$in": user["websSaved"]}}, {"_id": 0})
    return {"result": result}


@router.patch("/add/tag/{web_id}/{tag}")
def add_tag(web_id: str, tag: str, user=Depends(manager)):
    check_user(user)

    formatted_tag = tag.lower()
    Webs.update_one(
        {"webId": web_id, "userId": user["id"]},
        {"$addToSet": {"tags": formatted_tag}},
    )
    return {"result": "Tag added"}


@router.patch("/remove/tag/{web_id}/{tag}")
def remove_tag(web_id: str, tag: str, user=Depends(manager)):
    check_user(user)

    formatted_tag = tag.lower()
    Webs.update_one(
        {"webId": web_id, "userId": user["id"]},
        {"$pull": {"tags": formatted_tag}},
    )
    return {"result": "Tag added"}


@router.post("/iterate/{web_id}")
def iterate_web(web_id: str, iteratePayload: IterateWeb, user=Depends(manager)):
    """
    Iterate over a given web and create a new web with the same sources but with a new name and description.

    Args:
        web_id (str): The ID of the web to iterate over.
        iteratePayload (IterateWeb): The payload containing the new name and description for the new web.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the ID of the newly created web.

    Raises:
        HTTPException: If the web is not found, raises a 404 error.
    """
    check_user(user)

    webToIterate = Webs.find_one({"webId": web_id})
    associatedUser = Users.find_one({"id": webToIterate["userId"]}, {"_id": 0})

    if not webToIterate or not associatedUser:
        raise HTTPException(status_code=404, detail="Web or owner not found")

    try:

        newWebId = str(uuid.uuid4())

        try:
            newWebId, newSourceIds = neo4jClient.copy_sources_to_new_web(
                original_web_id=web_id,
                new_web_id=newWebId,
                new_user_id=user["id"],
                with_connections=iteratePayload.withConnections,
            )
        except Exception as e:
            logger.error(str(e))
            raise HTTPException(status_code=500, detail=str(e))

        web_to_insert = {
            "webId": newWebId,
            "name": iteratePayload.name,
            "description": iteratePayload.description,
            "userId": user["id"],
            "sourceIds": newSourceIds,
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
            "visibility": "Private",
            "tags": webToIterate["tags"],
            "iteratedFrom": associatedUser["id"],
            "likes": [],
            "iterations": [],
        }

        vectors = generate_web_embeddings(
            iteratePayload.name, iteratePayload.description
        )
        pincone_insert = web_to_insert.copy()

        pincone_insert["created"] = str(web_to_insert["created"])
        pincone_insert["updated"] = str(web_to_insert["updated"])
        embedding_data = [(newWebId, vectors, pincone_insert)]
        PCINDEX.upsert(
            vectors=embedding_data,
            namespace="webs",
        )

        Webs.insert_one(web_to_insert)
        Webs.find_one_and_update(
            {"webId": webToIterate["webId"]},
            {"$push": {"iterations": user["id"]}},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error iterating web: {str(e)}")

    return {"result": newWebId}


@router.get("/search")
def search_webs(
    query: str,
    visibility: Optional[Literal["Public", "Private"]] = Query(
        None, alias="visibility"
    ),
    userId: Optional[str] = None,
    webId: Optional[str] = None,
    user=Depends(manager.optional),
):
    if user:
        check_user(user)

    filter = {}
    if visibility:
        filter["visibility"] = {"$eq": visibility}
    if userId:
        filter["userId"] = {"$eq": userId}
    if webId:
        filter["webId"] = {"$eq": webId}

    search_info: Search = {
        "query": query,
        "timestamp": datetime.now(UTC),
        "userId": user["id"] if user else None,
        "filters": filter,
    }
    Searches.insert_one(search_info)

    try:
        results = run_semantic_search(query, 10, filter)
        logger.info(f"Semantic search results: {results}")
    except Exception as e:
        logger.info(f"Error running semantic search: {e}")
        logger.error(f"Error running semantic search: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error running semantic search: {e}"
        )

    return {"result": results}


@router.get("/contributers/{web_id}")
def get_web_contributors(web_id: str):
    web = Webs.find_one({"webId": web_id})
    if not web:
        raise HTTPException(status_code=404, detail=f"Web not found!")

    contributers = []
    for iteration in web["iterations"]:
        user = Users.find_one({"id": iteration}, {"_id": 0})
        if user:
            contributers.append(user)

    return {"result": contributers}
