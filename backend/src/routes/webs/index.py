import os
import uuid
import json
import boto3
from pytz import UTC
from datetime import datetime
from typing import Optional, Literal
from pymongo import ReturnDocument
from fastapi import APIRouter, Depends, UploadFile, File, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from src.models.index import Contributors
from src.routes.auth.utils import manager
from src.lib.s3.index import S3Bucket
from src.db.neo4j import client as neo4j_client
from src.models.index import (
    Webs,
    Web,
    CreateWeb,
    UpdateWeb,
    IterateWeb,
    Users,
    create_web,
    PublicUser,
    User,
    Search,
    Searches,
)
from src.lib.logger.index import logger
from src.core.config import settings
from src.lib.stytch.index import client as stytch_client
from src.lib.pinecone.index import client as pinecone_client
from src.service.web import service as web_service
from src.service.source import service as source_service
from src.utils.storage import track_file_storage
from src.utils.utility import clean_unicode

router = APIRouter()

s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3_session_client = boto3.client("s3")


@router.get("/all/user")
def get_user_webs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    criteria: Optional[str] = None,
    user: User = Depends(manager.required),
):
    """
    Retrieve paginated webs belonging to the authenticated user,
    with optional filtering by visibility (e.g., "Public", "Private").

    Args:
        page (int): The current page number (1-indexed).
        page_size (int): Number of items per page (max 100).
        criteria (str, optional): Visibility filter (e.g., "public", "private").
        user (User): The authenticated user.

    Returns:
        dict: Paginated list of the user's webs with metadata.
    """
    try:
        # construct base filter
        filter_query = {"userId": user.id}

        # normalize and apply visibility filter
        visibility = criteria.capitalize() if criteria else None
        if visibility:
            filter_query["visibility"] = visibility

        # query and sort by latest update
        all_webs = list(Webs.find(filter_query, {"_id": 0}, sort=[("updated", -1)]))

        total_webs = len(all_webs)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        paginated_webs = all_webs[start_index:end_index]

        return {
            "items": paginated_webs,
            "total": total_webs,
            "page": page,
            "page_size": page_size,
            "nextCursor": page + 1 if end_index < total_webs else None,
            "prevCursor": page - 1 if page > 1 else None,
        }

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching user webs {e}")


@router.get("/all")
async def get_webs(
    limit: int = 20,
    cursor: str = None,
    visibility: str = None,
    userId: str = None,
    user_making_request: User = Depends(manager.optional),
):
    """
    Retrieve webs with optional filtering by visibility, user ID, and cursor-based pagination.

    Args:
        limit (int): Max number of webs to fetch (default: 20).
        cursor (str): ISO timestamp to paginate older updates.
        visibility (str): Filter by visibility level (e.g., "Public").
        userId (str): Target user ID to fetch owned or contributed webs.
        user_making_request (User): The user making the request (optional).

    Returns:
        dict: A response containing the list of webs, next pagination cursor, and total count.
    """
    try:
        query = {}

        # determine if the requester is the same as the target user
        is_owner = user_making_request and user_making_request.id == userId

        # apply visibility filter
        if visibility:
            query["visibility"] = visibility

        # filter for user-owned and contributed webs
        if userId:
            contributions = list(
                Contributors.find({"userId": userId}, {"webId": 1, "_id": 0})
            )
            contributed_ids = [c["webId"] for c in contributions]

            user_query = {
                "$or": [{"userId": userId}, {"webId": {"$in": contributed_ids}}]
            }

            if not is_owner:
                # only show public webs to others
                query = {"$and": [user_query, {"visibility": "Public"}]}
            else:
                query.update(user_query)

        # apply cursor-based pagination filter
        if cursor:
            cursor_filter = {"updated": {"$lt": datetime.fromisoformat(cursor)}}

            if "$and" in query:
                query["$and"].append(cursor_filter)
            else:
                query.update(cursor_filter)

        # fetch webs with pagination
        webs_list = list(
            Webs.find(query, {"_id": 0})
            .sort("updated", -1)
            .limit(limit + 1)  # fetch one extra to check for next page
        )

        has_next = len(webs_list) > limit
        next_cursor = webs_list[-1]["updated"].isoformat() if has_next else None

        if has_next:
            webs_list = webs_list[:-1]

        return {"result": webs_list, "nextCursor": next_cursor}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail="Error fetching webs")


@router.get("/popular")
def get_popular_webs(limit: int = 10, _: User = Depends(manager.optional)):
    """
    Retrieve the most popular webs sorted by number of likes.

    Args:
        limit (int): Maximum number of webs to return (default: 10).
        _ (User): Optional authenticated user (unused but dependency is required).

    Returns:
        dict: A list of the most liked webs.
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
        logger.error(f"Error fetching popular webs: {e}")
        raise HTTPException(status_code=500, detail="Error fetching popular webs")


@router.get("/liked/user")
def get_user_liked_webs(user: User = Depends(manager.required)):
    """
    Retrieve all webs liked by the authenticated user,
    sorted by creation date in descending order.

    Args:
        user (User): The currently authenticated user.

    Returns:
        dict: A list of liked webs.
    """
    try:
        liked_webs = list(
            Webs.find({"likes": user.id}, {"_id": 0}, sort=[("created", -1)])
        )
        return {"result": liked_webs}

    except Exception as e:
        logger.error(f"Error fetching liked webs: {e}")
        raise HTTPException(status_code=500, detail="Error fetching liked webs")


@router.post("/create")
def create_web_endpoint(
    create_web_payload: CreateWeb,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required),
):
    """
    Endpoint to create a new web for the authenticated user.

    Args:
        create_web_payload (CreateWeb): The payload containing web creation data.
        background_tasks (BackgroundTasks): FastAPI's background task manager.
        user (User): The currently authenticated user.

    Returns:
        dict: Contains the ID of the newly created web.
    """
    try:
        # create the web and retrieve its ID
        web_id = create_web(create_web_payload, user.id)

        # fetch the created web document
        web_document = Webs.find_one({"webId": web_id, "userId": user.id})

        # queue background task to embed and upsert the web
        background_tasks.add_task(web_service.emebd_and_upsert_web, web_document)

        return {"result": web_id}

    except Exception as e:
        logger.error(f"Error creating web: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating web")


@router.post("/upload/image/{web_id}")
async def upload_image_to_web(
    web_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    _: User = Depends(manager.required.WRITE),
):
    """
    Upload multiple image files to a specific web.

    Args:
        web_id (str): The target web's ID.
        files (list[UploadFile]): List of image files to upload.
        user (User): The authenticated user with WRITE access.

    Returns:
        dict: A list of uploaded image URLs.
    """
    # verify that the target web exists
    web_data = Webs.find_one({"webId": web_id})
    if not web_data:
        raise HTTPException(status_code=404, detail="Web not found")

    web = Web(**web_data)
    uploaded_image_urls = []

    try:
        for file in files:
            # sanitize filename and prepare storage path
            safe_filename = secure_filename(file.filename)
            object_name = f"files/{web.userId}/{web_id}/images/{safe_filename}"

            temp_dir = "/tmp/web_uploads"
            os.makedirs(temp_dir, exist_ok=True)

            temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{safe_filename}")

            try:
                # read file content and write to temp location
                contents = await file.read()
                with open(temp_path, "wb") as buffer:
                    buffer.write(contents)

                # track user storage usage
                fileStorageResult = track_file_storage(
                    fileSizeBytes=len(contents),
                    userId=web.userId,
                    operation="$inc",
                )

                if not fileStorageResult:
                    raise HTTPException(
                        status_code=400, detail="Storage limit exceeded"
                    )

                # upload to s3 and construct public url
                s3_bucket.upload_file(temp_path, object_name)
                image_url = f"https://{settings.cloudfront_domain}/{object_name}"
                uploaded_image_urls.append(image_url)

                # update web document with new image and updated timestamp
                result = Webs.update_one(
                    {"webId": web_id},
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
                # clean up temporary file
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        return {"imageUrls": uploaded_image_urls}

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/image/{web_id}/{image_name}")
def delete_image(
    web_id: str, image_name: str, user: User = Depends(manager.required.WRITE)
):
    """
    Delete an image from a given web project in both the database and S3 storage.

    Args:
        web_id (str): The ID of the web to which the image belongs.
        image_name (str): The filename of the image to delete.
        user (User): The authenticated user with WRITE access to the web.

    Returns:
        dict: A dictionary indicating whether the deletion was successful.

    Raises:
        HTTPException:
            - 404 if the web or image is not found.
            - 500 if an unexpected error occurs during deletion.
    """
    try:
        # fetch the web document
        web_data = Webs.find_one({"webId": web_id})
        if not web_data:
            raise HTTPException(status_code=404, detail="Web not found")

        web = Web(**web_data)
        filepath = f"files/{web.userId}/{web_id}/images/{image_name}"

        # get object metadata from s3 to determine file size
        try:
            response = s3_session_client.head_object(
                Bucket=s3_bucket.bucket_name, Key=filepath
            )
            file_size_bytes = response["ContentLength"]
        except ClientError as e:
            logger.error(f"Error retrieving object metadata: {e}")
            raise HTTPException(status_code=404, detail="Image not found in S3")

        # remove image reference from the database
        result = Webs.update_one(
            {"webId": web_id},
            {"$pull": {"imageKeys": filepath}, "$set": {"updated": datetime.now(UTC)}},
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Web not found")

        # delete the image from s3 storage
        s3_session_client.delete_object(Bucket=s3_bucket.bucket_name, Key=filepath)

        # decrement user's file storage usage
        track_file_storage(
            fileSizeBytes=file_size_bytes, userId=web.userId, operation="$dec"
        )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/images/web/{web_id}")
def get_web_images(web_id: str, _: Optional[User] = Depends(manager.optional.READ)):
    """
    Retrieve all image URLs associated with the specified web.

    Args:
        web_id (str): The ID of the web to fetch image URLs from.
        _ (Optional[User]): Optional authenticated user with read access.

    Returns:
        dict: A dictionary with a "result" key containing a list of image URLs.

    Raises:
        HTTPException:
            - 404 if the web is not found.
            - 500 if there's an error generating the URLs.
    """
    try:
        web_data = Webs.find_one({"webId": web_id})
        if not web_data:
            raise HTTPException(status_code=404, detail="Web not found")

        web = Web(**web_data)

        urls = [f"https://{settings.cloudfront_domain}/{key}" for key in web.imageKeys]

        return {"result": urls}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{web_id}")
def delete_web(
    web_id: str,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required.OWNER),
):
    """
    Delete a web and all associated data, including sources, documents, images,
    embeddings, and S3 files. Also updates the user's file storage usage.

    Args:
        web_id (str): ID of the web to delete.
        background_tasks (BackgroundTasks): FastAPI background task runner.
        user (User): Authenticated user with OWNER-level permissions.

    Returns:
        dict: {"result": True} if deleted, {"result": False} if not found or not owned.

    Raises:
        HTTPException: 500 if an unexpected error occurs during deletion.
    """
    try:
        # delete the web document from the database
        web_to_delete = Webs.find_one_and_delete({"webId": web_id, "userId": user.id})

        if not web_to_delete:
            logger.info(f"Web {web_id} not found or not owned by user {user.id}")
            return {"result": False}

        logger.info(f"Web {web_id} deleted by user {user.id}")

        # schedule deletion of embeddings
        background_tasks.add_task(
            web_service.delete_web_embeddings,
            webId=web_id,
            userId=user.id,
        )

        # prepare to clean up associated files from S3
        path_to_clean = f"files/{user.id}/{web_id}"
        delete_keys = []
        total_bytes_to_decrement = 0

        paginator = s3_session_client.get_paginator("list_objects_v2").paginate(
            Bucket=s3_bucket.bucket_name,
            Prefix=path_to_clean,
        )

        for page in paginator:
            if "Contents" in page:
                for obj in page["Contents"]:
                    delete_keys.append({"Key": obj["Key"]})
                    total_bytes_to_decrement += obj["Size"]

        # delete files from S3 and update user storage
        if delete_keys:
            s3_session_client.delete_objects(
                Bucket=s3_bucket.bucket_name,
                Delete={"Objects": delete_keys},
            )

            logger.info(f"Deleted {len(delete_keys)} files from S3 for web {web_id}")

            track_file_storage(
                fileSizeBytes=total_bytes_to_decrement,
                userId=user.id,
                operation="$dec",
            )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error deleting web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/{web_id}")
def update_web(
    web_id: str,
    update_web_payload: UpdateWeb,
    background_tasks: BackgroundTasks,
    _: User = Depends(manager.required.WRITE),
):
    """
    Update an existing web with new configuration values.

    Args:
        web_id (str): The ID of the web to update.
        update_web_payload (UpdateWeb): Payload containing updated fields.
        background_tasks (BackgroundTasks): FastAPI background task runner.
        _ (User): Authenticated user with WRITE access.

    Returns:
        dict: {"result": True} if update was successful.

    Raises:
        HTTPException:
            - 404 if the web is not found or no changes were applied.
            - 500 if an unexpected error occurs.
    """
    try:
        # fetch the existing web
        web_data = Webs.find_one({"webId": web_id})
        if not web_data:
            raise HTTPException(status_code=404, detail="Web not found")

        # prepare fields to update
        update_fields = update_web_payload.model_dump(exclude_none=True)
        update_fields["updated"] = datetime.now(UTC)

        # schedule embedding update
        background_tasks.add_task(
            web_service.update_emebeddings,
            web_id,
            update_fields,
        )

        # perform update in the database
        result = Webs.update_one(
            {"webId": web_id},
            {"$set": update_fields},
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, detail="Web not found or no changes applied"
            )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error updating web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/web/{web_id}")
def get_web_by_id(
    web_id: str,
    _: Optional[User] = Depends(
        manager.optional.READ
    ),  # Dependency handles visibility check
):
    """
    Retrieve a web by its unique ID.

    Args:
        web_id (str): The ID of the web to retrieve.
        _ (Optional[User]): Optional authenticated user (used for visibility checks).

    Returns:
        dict: A dictionary containing the web data under the "result" key.

    Raises:
        HTTPException:
            - 404 if the web is not found.
            - 500 if an unexpected error occurs.
    """
    try:
        web_data = Webs.find_one({"webId": web_id}, {"_id": 0})
        if not web_data:
            raise HTTPException(status_code=404, detail="Web not found")

        web = Web(**web_data)
        return {"result": web.model_dump()}

    except Exception as e:
        logger.error(f"Error getting web by id: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/like/{web_id}")
def like_web(
    web_id: str,
    user: User = Depends(manager.required),
):
    """
    Like a web on behalf of the current user.

    Args:
        web_id (str): The ID of the web to like.
        user (User): The authenticated user performing the like action.

    Returns:
        dict: A dictionary with the updated number of likes under the "result" key.

    Raises:
        HTTPException:
            - 400 if the user already liked the web or if the web does not exist.
            - 500 if an unexpected error occurs.
    """
    try:
        updated_web = Webs.find_one_and_update(
            {
                "webId": web_id,
                "likes": {"$ne": user.id},
            },  # only update if not already liked
            {"$addToSet": {"likes": user.id}},  # add user ID to 'likes' array
            return_document=ReturnDocument.AFTER,
        )

        if not updated_web:
            raise HTTPException(
                status_code=400, detail="Already liked or web not found"
            )

        return {"result": len(updated_web["likes"])}

    except Exception as e:
        logger.error(f"Error liking web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unlike/{web_id}")
def unlike_web(
    web_id: str,
    user: User = Depends(manager.required),
):
    """
    Unlike a previously liked web on behalf of the current user.

    Args:
        web_id (str): The ID of the web to unlike.
        user (User): The authenticated user performing the unlike action.

    Returns:
        dict: A dictionary with the updated number of likes under the "result" key.

    Raises:
        HTTPException:
            - 400 if the web was not liked by the user or does not exist.
            - 500 if an unexpected error occurs.
    """
    try:
        updated_web = Webs.find_one_and_update(
            {"webId": web_id, "likes": user.id},  # only update if user already liked it
            {"$pull": {"likes": user.id}},  # remove user ID from 'likes' array
            return_document=ReturnDocument.AFTER,
        )

        if not updated_web:
            raise HTTPException(
                status_code=400, detail="Not liked yet or web not found"
            )

        return {"result": len(updated_web["likes"])}

    except Exception as e:
        logger.error(f"Error unliking web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/saved/user/{user_id}")
def get_user_saved_webs(
    user_id: str,
    user: Optional[User] = Depends(manager.optional),
):
    """
    Retrieve all saved webs for a user.
    If the requesting user is not the resource owner, only public webs are returned.

    Args:
        user_id (str): ID of the user whose webs are being requested.
        user (Optional[User]): Authenticated user (optional).

    Returns:
        dict: A dictionary with the user's saved webs under the "result" key.

    Raises:
        HTTPException: 500 if an unexpected error occurs.
    """
    query = {"userId": user_id}
    resource_owner = user is not None and user.id == user_id

    if not resource_owner:
        query["visibility"] = "Public"

    try:
        result = Webs.find(query, {"_id": 0})
        return {"result": result}

    except Exception as e:
        logger.error(f"Error getting user saved webs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/add/tag/{web_id}/{tag}")
def add_tag(
    web_id: str,
    tag: str,
    _: User = Depends(manager.required.WRITE),
):
    """
    Add a tag to a web.

    Args:
        web_id (str): The ID of the web to tag.
        tag (str): The tag to add.
        user (User): Authenticated user with WRITE access.

    Returns:
        dict: {"result": True} if the tag was added successfully.

    Raises:
        HTTPException: 500 if an unexpected error occurs.
    """
    try:
        formatted_tag = tag.lower()
        Webs.update_one(
            {"webId": web_id},
            {"$addToSet": {"tags": formatted_tag}},
        )
        return {"result": True}

    except Exception as e:
        logger.error(f"Error adding tag: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/remove/tag/{web_id}/{tag}")
def remove_tag(
    web_id: str,
    tag: str,
    _: User = Depends(manager.required.WRITE),
):
    """
    Remove a tag from a web.

    Args:
        web_id (str): The ID of the web to update.
        tag (str): The tag to remove.
        user (User): Authenticated user with WRITE access.

    Returns:
        dict: {"result": True} if the tag was removed successfully.

    Raises:
        HTTPException: 500 if an unexpected error occurs.
    """
    try:
        formatted_tag = tag.lower()
        Webs.update_one(
            {"webId": web_id},
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
    user: User = Depends(manager.required.READ),
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
    try:
        # get original web + owner
        web_to_iterate = Webs.find_one({"webId": web_id})

        if not web_to_iterate:
            raise HTTPException(status_code=404, detail="Original web not found")

        web_to_iterate = Web(**web_to_iterate)

        original_web_owner = Users.find_one({"id": web_to_iterate.userId}, {"_id": 0})

        if not original_web_owner:
            raise HTTPException(status_code=404, detail="Owner not found")

        original_web_owner = User(**original_web_owner)

        # create a new web first to generate a new webId
        create_web_payload = CreateWeb(
            name=iteratePayload.name,
            description=iteratePayload.description,
            visibility="Private",
            tags=web_to_iterate.tags,
            sourceIds=[],
            imageKeys=[],
            enableAIConnections=False,
            showcase=False,
        )

        new_web_id = create_web(create_web_payload, user.id)

        # copy sources in Neo4j to the new web
        try:
            _, new_source_ids = neo4j_client.copy_sources_to_new_web(
                original_web_id=web_id,
                new_web_id=new_web_id,
                new_user_id=user.id,
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
                    "iteratedFrom": original_web_owner.id,
                    "updated": datetime.now(UTC),
                }
            },
        )

        Webs.update_one(
            {"webId": web_id},
            {"$push": {"iterations": original_web_owner.id}},
        )

        # queue embedding
        web_doc = Webs.find_one({"webId": new_web_id})
        if web_doc:
            background_task.add_task(web_service.emebd_and_upsert_web, web_doc)
            logger.info(f"Queued embedding for new web: {new_web_id}")
            background_task.add_task(
                source_service.embed_iterated_sources, new_source_ids
            )
            logger.info(f"Queued embedding for new sources: {new_source_ids}")

        return {"result": new_web_id}

    except Exception as e:
        logger.error(f"Error iterating web: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error iterating web: {str(e)}")


@router.post("/iterate/{web_id}")
def iterate_web(
    web_id: str,
    iteratePayload: IterateWeb,
    background_task: BackgroundTasks,
    user: User = Depends(manager.required.READ),
):
    """
    Creates a new web by iterating an existing one.

    This duplicates a web's structure and sources with a new name and description.

    Steps:
    1. Fetch the original web and its owner.
    2. Create a new web with new metadata but copied tags.
    3. Copy the original web’s sources into the new web via Neo4j.
    4. Update the new web in MongoDB with the copied source IDs and iteration metadata.
    5. Trigger background embedding for the new web and its sources.

    Args:
        web_id (str): ID of the original web to iterate from.
        iteratePayload (IterateWeb): Contains new web name, description, and connection options.
        background_task (BackgroundTasks): For async background processing.
        user (User): The current authenticated user with read access.

    Returns:
        dict: Contains the newly created web's ID.
    """
    try:
        # fetch original web
        web_to_iterate = Webs.find_one({"webId": web_id})
        if not web_to_iterate:
            raise HTTPException(status_code=404, detail="Original web not found")
        web_to_iterate = Web(**web_to_iterate)

        # fetch original web's owner
        original_owner_doc = Users.find_one({"id": web_to_iterate.userId}, {"_id": 0})
        if not original_owner_doc:
            raise HTTPException(status_code=404, detail="Owner not found")
        original_web_owner = User(**original_owner_doc)

        # create a new web to generate a fresh webId
        new_web_payload = CreateWeb(
            name=iteratePayload.name,
            description=iteratePayload.description,
            visibility="Private",
            tags=web_to_iterate.tags,
            sourceIds=[],
            imageKeys=[],
            enableAIConnections=False,
            showcase=False,
        )
        new_web_id = create_web(new_web_payload, user.id)

        # copy sources in Neo4j to the new web
        try:
            _, new_source_ids = neo4j_client.copy_sources_to_new_web(
                original_web_id=web_id,
                new_web_id=new_web_id,
                new_user_id=user.id,
                with_connections=iteratePayload.withConnections,
            )
        except Exception as e:
            logger.error(f"Neo4j copy error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error copying sources")

        # update new and original webs in MongoDB
        Webs.update_one(
            {"webId": new_web_id},
            {
                "$set": {
                    "sourceIds": new_source_ids,
                    "iteratedFrom": original_web_owner.id,
                    "updated": datetime.now(UTC),
                }
            },
        )

        Webs.update_one(
            {"webId": web_id},
            {
                "$push": {"iterations": user.id}
            },  # add user to iterations of original web
        )

        # trigger background embedding for web and sources
        web_doc = Webs.find_one({"webId": new_web_id})
        if web_doc:
            background_task.add_task(web_service.emebd_and_upsert_web, web_doc)
            logger.info(f"Queued embedding for new web: {new_web_id}")

            background_task.add_task(
                source_service.embed_iterated_sources, new_source_ids
            )
            logger.info(f"Queued embedding for new sources: {new_source_ids}")

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
    user: Optional[User] = Depends(manager.optional),
):
    """
    Perform a semantic search across webs.

    This endpoint allows searching for webs using a semantic query.
    Optional filters can be applied based on visibility, user ownership, or specific web IDs.

    Args:
        query (str): The search query string.
        visibility (Optional[Literal["Public", "Private"]]): Filter by visibility level.
        userId (Optional[str]): Filter results by the creator's user ID.
        webId (Optional[str]): Filter results by a specific web ID.
        user (Optional[User]): The current authenticated user, if any.

    Returns:
        dict: The top 20 search results matching the filters and semantic query.
    """
    try:
        # build filter for Pinecone query
        filter = {}

        if visibility:
            filter["visibility"] = {"$eq": visibility}
            if visibility == "Private":
                if not user:
                    raise HTTPException(status_code=401, detail="Unauthorized")
                filter["userId"] = {"$eq": user.id}

        if userId:
            filter["userId"] = {"$eq": userId}

        if webId:
            filter["webId"] = {"$eq": webId}

        # log the search event
        search_info: Search = {
            "query": query,
            "timestamp": datetime.now(UTC),
            "userId": user.id if user else None,
            "filters": filter,
        }
        Searches.insert_one(search_info)

        # run semantic search via Pinecone
        results = pinecone_client.run_semantic_search(
            query=query,
            namespace="webs",
            filter=filter,
            limit=20,
        )

        return {"result": results}

    except Exception as e:
        logger.error(f"Error running semantic search: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error running semantic search: {e}",
        )


@router.get("/contributers/{web_id}")
def get_web_contributors(
    web_id: str,
    _: Optional[User] = Depends(manager.optional),
):
    """
    Retrieve the list of contributors for a given web.

    Contributors are defined as the users listed in the `iterations` field of the web document.

    Args:
        web_id (str): The unique identifier of the web.
        user (Optional[User]): The optionally authenticated user making the request.

    Returns:
        dict: A list of public user data for each contributor.
    """
    try:
        # find the web by ID
        web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail="Web not found")

        web = Web(**web)

        # collect contributors from iterations list
        contributers = []
        for iteration_user_id in web.iterations:
            user_doc = Users.find_one({"id": iteration_user_id}, {"_id": 0})
            if user_doc:
                public_user = PublicUser(**user_doc)
                contributers.append(public_user.model_dump())

        return {"result": contributers}

    except Exception as e:
        logger.error(f"Error getting web contributers: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting web contributers: {e}",
        )


class ExportGraphContext(BaseModel):
    webId: str
    selectedSources: list[str]
    asMarkdown: bool = False


@router.post("/export/graph/context")
def export_graph_context(
    payload: ExportGraphContext,
    _: Optional[User] = Depends(manager.optional),
):
    """
    Export the graph context of a given web as a JSON object or a downloadable Markdown file.

    Args:
        payload (ExportGraphContext): Contains the target webId, selected source node IDs, and export format.
        user (Optional[User]): The optionally authenticated user requesting the export.

    Returns:
        Union[dict, StreamingResponse]: Graph data as JSON or markdown file depending on the payload.
    """
    try:
        # fetch the web by ID
        web = Webs.find_one({"webId": payload.webId})
        if not web:
            raise HTTPException(status_code=404, detail="Web not found")

        # retrieve the graph data from Neo4j
        result = neo4j_client.retreive_graph(
            webId=payload.webId,
            selectedNodes=payload.selectedSources,
        )

        # sanitize output
        web = clean_unicode(web)
        result = clean_unicode(result)

        logger.info(f"Exported graph context for web {payload.webId}")

        # return markdown file if requested
        if payload.asMarkdown:
            markdown_content = (
                f"# {web['name']}\n\n{json.dumps(result, indent=2, ensure_ascii=True)}"
            )
            safe_filename = clean_unicode(web["name"][:40])
            filename = f"{safe_filename}.md"

            def generate():
                yield markdown_content.encode("utf-8")

            return StreamingResponse(
                generate(),
                media_type="text/markdown; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            )

        # return raw graph result as JSON
        return {"result": result}

    except Exception as e:
        logger.error(f"Error exporting graph context: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error exporting graph context: {e}"
        )
