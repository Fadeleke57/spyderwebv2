import os
import uuid
import boto3
from pytz import UTC
from datetime import datetime
from typing import Optional, Literal
from pymongo import ReturnDocument
from fastapi import APIRouter, Depends, UploadFile, File, Query, BackgroundTasks
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from src.routes.auth.oauth2 import manager
from src.lib.s3.index import S3Bucket
from src.utils.exceptions import check_user
from src.db.neo4j import client as neo4jClient
from src.models.index import (
    Webs,
    Web,
    CreateWeb,
    UpdateWeb,
    IterateWeb,
    User,
    Users,
    Search,
    Searches,
    create_web,
)
from src.lib.logger.index import logger
from src.core.config import settings
from src.lib.pinecone.index import client as pineconeClient
from src.service.web import service as webService
from copy import deepcopy

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
    try:
        query = {"visibility": "Public"}

        if cursor:
            query["updated"] = {"$lt": datetime.fromisoformat(cursor)}

        webs_list = list(
            Webs.find(query, {"_id": 0}).sort("updated", -1).limit(limit + 1)
        )

        has_next_page = len(webs_list) > limit
        next_cursor = None

        if has_next_page:
            webs_list = webs_list[:-1]
            next_cursor = webs_list[-1]["updated"]

        return {"result": webs_list, "nextCursor": next_cursor}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


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
    try:
        pipeline = [
            {"$addFields": {"likesCount": {"$size": "$likes"}}},
            {"$sort": {"likesCount": -1}},
            {"$limit": limit},
            {"$project": {"_id": 0, "likesCount": 0}},
        ]
        top_webs = list(Webs.aggregate(pipeline))
        return {"result": top_webs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


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
    try:
        likedWebs = list(
            Webs.find({"likes": user["id"]}, {"_id": 0}, sort=[("created", -1)])
        )
        return {"result": likedWebs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.post("/create")
def create_web_endpoint(
    createWebPayload: CreateWeb,
    background_tasks: BackgroundTasks,
    user=Depends(manager),
):
    """
    Create a new web.

    Args:
        createWebPayload (CreateWeb): The web to create.
        background_tasks (BackgroundTasks): A FastAPI BackgroundTasks instance.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the ID of the newly created web.

    Raises:
        HTTPException: If web creation fails.
    """
    check_user(user)
    try:

        web_id = create_web(createWebPayload, user["id"])

        web_document = Webs.find_one({"webId": web_id, "userId": user["id"]})

        pinecone_document = web_document
        background_tasks.add_task(webService.emebd_and_upsert_web, web_document)

        return {"result": web_id}

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
    try:

        filepath = f"files/{user['id']}/{web_id}/images/{image_name}"

        result = Webs.update_one(
            {"webId": web_id, "userId": user["id"], "imageKeys": filepath},
            {"$pull": {"imageKeys": filepath}, "$set": {"updated": datetime.now(UTC)}},
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Web not found")

        s3.delete_object(Bucket=s3_bucket.bucket_name, Key=filepath)
        return {"result": True}

    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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
    try:
        web: Web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail=f"Web not found!")

        imageKeys = web.get("imageKeys", [])
        urls = []

        for key in imageKeys:
            url = f"https://{settings.cloudfront_domain}/{key}"
            urls.append(url)

        return {"result": urls}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    try:
        webToDelete = Webs.find_one_and_delete({"webId": webId, "userId": user["id"]})
        if not webToDelete:
            logger.info(f"Web {webId} not found or not owned by user {user['id']}")
            return {"result": "Web not found"}

        logger.info(f"Web {webId} deleted by user {user['id']}")

        result = pineconeClient.index.delete(
            ids=[webId], namespace="webs"
        )  # these need to run in the background (refactor to a web service that handles deletions)
        if result == {}:
            logger.info(f"Web {webId} deleted from Pinecone")
        result = pineconeClient.index.delete(
            ids=webToDelete.get("sourceIds", []), namespace=webId
        )
        if result == {}:
            logger.info(f"Web {webId} deleted from Pinecone")

        neo4jClient.delete_nodes_by_properties("source", {"webId": webId})
        logger.info(f"Sources {webId} attached to web deleted from Neo4j")

        images_path = f"files/{user['id']}/{webId}/images"
        pages = s3.get_paginator("list_objects_v2").paginate(
            Bucket=s3_bucket.bucket_name, Prefix=images_path
        )
        delete_keys = []
        for page in pages:
            if "Contents" in page:
                for obj in page["Contents"]:
                    delete_keys.append({"Key": obj["Key"]})
        if delete_keys:
            s3.delete_objects(
                Bucket=s3_bucket.bucket_name, Delete={"Objects": delete_keys}
            )
            logger.info(f"Deleted {len(delete_keys)} images from S3 for web {webId}")

        return {"result": True}

    except Exception as e:
        logger.error(f"Error deleting web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/{webId}")
def update_web(
    webId: str,
    updateWebPayload: UpdateWeb,
    background_tasks: BackgroundTasks,
    user=Depends(manager),
):
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
    try:
        web = Webs.find_one({"webId": webId, "userId": user["id"]})
        if not web:
            raise HTTPException(status_code=404, detail="Web not found")

        update_fields = updateWebPayload.model_dump(exclude_none=True)
        update_fields["updated"] = datetime.now(UTC)

        background_tasks.add_task(webService.update_emebeddings, webId, update_fields)

        result = Webs.update_one(
            {"webId": webId, "userId": user["id"]}, {"$set": update_fields}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, detail="Web not found or no changes applied"
            )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error updating web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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

    try:
        web: Web = Webs.find_one({"webId": webId}, {"_id": 0})

        if not web or (
            web["visibility"] == "Private"
            and not user
            and user.get("id", "") != web["userId"]
        ):
            raise HTTPException(status_code=404, detail="Item not found")
        else:
            return {"result": web}

    except Exception as e:
        logger.error(f"Error getting web by id: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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

    try:
        result = Webs.find_one_and_update(
            {"webId": web_id, "likes": {"$ne": user["id"]}},
            {"$addToSet": {"likes": user["id"]}},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            raise HTTPException(
                status_code=400, detail="Already liked or web not found"
            )
        return {"result": len(result["likes"])}

    except Exception as e:
        logger.error(f"Error liking web: {str(e)}")


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
    try:
        result = Webs.find_one_and_update(
            {"webId": web_id, "likes": user["id"]},
            {"$pull": {"likes": user["id"]}},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            raise HTTPException(
                status_code=400, detail="Not liked yet or web not found"
            )
        return {"result": len(result["likes"])}

    except Exception as e:
        logger.error(f"Error unliking web: {str(e)}")


@router.get("/saved/user")
def get_user_saved_webs(user=Depends(manager)):
    check_user(user)
    try:

        result = Webs.find({"webId": {"$in": user["websSaved"]}}, {"_id": 0})
        return {"result": result}

    except Exception as e:
        logger.error(f"Error getting user saved webs: {str(e)}")


@router.patch("/add/tag/{web_id}/{tag}")
def add_tag(web_id: str, tag: str, user=Depends(manager)):
    check_user(user)
    try:

        formatted_tag = tag.lower()
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$addToSet": {"tags": formatted_tag}},
        )
        return {"result": True}

    except Exception as e:
        logger.error(f"Error adding tag: {str(e)}")


@router.patch("/remove/tag/{web_id}/{tag}")
def remove_tag(web_id: str, tag: str, user=Depends(manager)):
    check_user(user)

    try:

        formatted_tag = tag.lower()
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$pull": {"tags": formatted_tag}},
        )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error removing tag: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/iterate/{web_id}")
def iterate_web(
    web_id: str,
    iteratePayload: IterateWeb,
    background_task: BackgroundTasks,
    user=Depends(manager),
):
    """
    Iterate over a given web and create a new web with the same sources but with a new name and description.

    Steps:
    1. Look up the original web and user.
    2. Create a new web (generates a new webId).
    3. Copy sources from the original web to the new one via Neo4j.
    4. Update the new web in Mongo with the new sourceIds and iteration info.
    5. Queue embedding task.
    """
    check_user(user)

    try:
        # get original web + owner
        web_to_iterate: Web = Webs.find_one({"webId": web_id})
        if not web_to_iterate:
            raise HTTPException(status_code=404, detail="Original web not found")

        associated_user = Users.find_one({"id": web_to_iterate["userId"]}, {"_id": 0})
        if not associated_user:
            raise HTTPException(status_code=404, detail="Owner not found")

        # create a new web first to generate a new webId
        create_web_payload = CreateWeb(
            name=iteratePayload.name,
            description=iteratePayload.description,
            visibility="Private",
            tags=web_to_iterate.get("tags", []),
            sourceIds=[],  # will update this after Neo4j step
            imageKeys=[],
            enableAIConnections=False,
            showcase=False,
        )
        new_web_id = create_web(create_web_payload, user["id"])

        # copy sources in Neo4j to the new web
        try:
            _, new_source_ids = neo4jClient.copy_sources_to_new_web(
                original_web_id=web_id,
                new_web_id=new_web_id,
                new_user_id=user["id"],
                with_connections=iteratePayload.withConnections,
            )
        except Exception as e:
            logger.error(f"Neo4j copy error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error copying sources")

        # update new web in MongoDB with sourceIds and iteratedFrom
        Webs.update_one(
            {"webId": new_web_id},
            {
                "$set": {
                    "sourceIds": new_source_ids,
                    "iteratedFrom": associated_user["id"],
                    "updated": datetime.now(UTC),
                }
            },
        )

        Webs.update_one(
            {"webId": web_id},
            {"$push": {"iterations": user["id"]}},
        )

        # queue embedding
        web_doc = Webs.find_one({"webId": new_web_id})
        if web_doc:
            background_task.add_task(webService.emebd_and_upsert_web, web_doc)

        return {"result": new_web_id}

    except Exception as e:
        logger.error(f"Error iterating web: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error iterating web: {str(e)}")


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

    try:
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

        results = pineconeClient.run_semantic_web_search(query, filter=filter, limit=20)
        return {"result": results}

    except Exception as e:
        logger.error(f"Error running semantic search: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error running semantic search: {e}"
        )


@router.get("/contributers/{web_id}")
def get_web_contributors(web_id: str, user=Depends(manager.optional)):
    if user:
        check_user(user)

    try:
        web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail=f"Web not found!")

        contributers = []
        for iteration in web["iterations"]:
            user = Users.find_one({"id": iteration}, {"_id": 0})
            if user:
                contributers.append(user)

        return {"result": contributers}

    except Exception as e:
        logger.error(f"Error getting web contributers: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error getting web contributers: {e}"
        )
