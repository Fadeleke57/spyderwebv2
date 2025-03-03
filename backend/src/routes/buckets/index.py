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
from src.models.analytics import Search, Searches
from src.models.source import Sources, Source
from src.models.connection import Connections, ConnectionType, ConnectionData
from datetime import datetime
from src.models.bucket import Buckets, BucketConfig, UpdateBucket, IterateBucket, Bucket
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from src.lib.logger.index import logger
from pymongo import ReturnDocument
from src.core.config import settings
import boto3
from src.lib.pinecone.index import PCINDEX, PC, generate_bucket_embeddings

router = APIRouter()

s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3 = boto3.client("s3")


@router.get("/all/user")
def get_user_buckets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    criteria: Optional[str] = None,
    user: User = Depends(manager),
):
    """
    Retrieve paginated buckets belonging to a user, sorted by creation date in descending order,
    with an optional limit on the total number of buckets.

    Args:
        page (int): The current page number.
        page_size (int): The number of items per page.
        limit (int, optional): Maximum number of buckets to fetch.
        user (User): The user whose buckets are to be retrieved.

    Returns:
        dict: A JSON response containing the paginated list of buckets and pagination metadata.
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
            buckets = list(
                Buckets.find(
                    {"visibility": visibility, "userId": user["id"]}, {"_id": 0}
                )
            )
        else:
            buckets = list(
                Buckets.find({"userId": user["id"]}, {"_id": 0}, sort=[("updated", -1)])
            )

        # pagination
        total_buckets = len(buckets)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_buckets = buckets[start_index:end_index]

        next_cursor = page + 1 if end_index < total_buckets else None
        prev_cursor = page - 1 if page > 1 else None

        return {
            "items": paginated_buckets,
            "total": total_buckets,
            "page": page,
            "page_size": page_size,
            "nextCursor": next_cursor,
            "prevCursor": prev_cursor,
        }

    except Exception as e:
        logger.error(f"Error fetching buckets: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching buckets {e}")


@router.get("/all/public")
async def get_public_buckets(limit: int = 20, cursor: str = None):
    """
    Retrieve public buckets with cursor-based pagination.

    Parameters
    ----------
    limit : int
        Number of buckets to return per page
    cursor : str
        Timestamp-based cursor for pagination

    Returns
    -------
    dict
        Dictionary containing buckets and next cursor
    """
    query = {"visibility": "Public"}

    if cursor:
        query["updated"] = {"$lt": datetime.fromisoformat(cursor)}

    buckets_list = list(
        Buckets.find(query, {"_id": 0}).sort("updated", -1).limit(limit + 1)
    )

    has_next_page = len(buckets_list) > limit
    next_cursor = None

    if has_next_page:
        buckets_list = buckets_list[:-1]
        next_cursor = buckets_list[-1]["updated"]

    return {"result": buckets_list, "nextCursor": next_cursor}


@router.get("/popular")
def get_popular_buckets(limit: int = 10):
    """
    Retrieve popular buckets with cursor-based pagination.

    Parameters
    ----------
    limit : int
        Number of buckets to return per page

    Returns
    -------
    dict
        Dictionary containing buckets and next cursor
    """
    pipeline = [
        {"$addFields": {"likesCount": {"$size": "$likes"}}},
        {"$sort": {"likesCount": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "likesCount": 0}},
    ]
    top_buckets = list(Buckets.aggregate(pipeline))
    return {"result": top_buckets}


@router.get("/liked/user")  # get all liked buckets belonging to a user
def get_user_liked_buckets(user: User = Depends(manager)):
    """
    Retrieve all buckets liked by a user.

    Args:
        user (User): The user whose liked buckets are to be retrieved.

    Returns:
        dict: A JSON response containing a list of liked buckets sorted by creation date in descending order.
    """
    check_user(user)
    likedBuckets = Buckets.find(
        {"likes": user["id"]}, {"_id": 0}, sort=[("created", -1)]
    )
    return {"result": likedBuckets}


@router.post("/create")
def create_bucket(config: BucketConfig, user=Depends(manager)):
    """
    Create a new bucket.

    Args:
        config (BucketConfig): The configuration for the new bucket.
        user (User): The user creating the bucket.

    Returns:
        dict: A JSON response with a result key containing the ID of the new bucket.
    """
    check_user(user)
    try:
        bucketId = str(uuid.uuid4())
        bucket_to_insert = {
            "bucketId": bucketId,
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
        vectors = generate_bucket_embeddings(config.name, config.description)
        pincone_insert = bucket_to_insert.copy()
        pincone_insert["created"] = str(bucket_to_insert["created"])
        pincone_insert["updated"] = str(bucket_to_insert["updated"])
        embedding_data = [(bucketId, vectors, pincone_insert)]
        PCINDEX.upsert(
            vectors=embedding_data,
            namespace="buckets",
        )

        # mongo insert
        Buckets.insert_one(bucket_to_insert)
        return {"result": bucketId}

    except Exception as e:
        logger.error(f"Error creating bucket: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/image/{bucket_id}")
async def upload_file(
    bucket_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user=Depends(manager),
):

    check_user(user)
    uploaded_image_urls = []

    try:
        for file in files:
            # sanitize filename
            safe_filename = secure_filename(file.filename)
            object_name = f"files/{user['id']}/{bucket_id}/images/{safe_filename}"

            temp_dir = "/tmp/bucket_uploads"
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

                result = Buckets.update_one(
                    {"bucketId": bucket_id, "userId": user["id"]},
                    {
                        "$push": {"imageKeys": object_name},
                        "$set": {"updated": datetime.now(UTC)},
                    },
                )

                if result.modified_count == 0:
                    raise HTTPException(status_code=404, detail="Bucket not found")

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


@router.delete("/delete/image/{bucket_id}/{image_name}")
def delete_image(bucket_id: str, image_name: str, user=Depends(manager)):
    check_user(user)

    filepath = f"files/{user['id']}/{bucket_id}/images/{image_name}"

    result = Buckets.update_one(
        {"bucketId": bucket_id, "userId": user["id"], "imageKeys": filepath},
        {"$pull": {"imageKeys": filepath}, "$set": {"updated": datetime.now(UTC)}},
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bucket not found")

    s3.delete_object(Bucket=s3_bucket.bucket_name, Key=filepath)
    return {"result": "Image deleted"}


@router.get("/images/bucket/{bucket_id}")
def get_bucket_images(bucket_id: str):
    """
    Retrieve all image URLs associated with a given bucket.

    Args:
        bucket_id (str): The ID of the bucket to retrieve images for.

    Returns:
        dict: A JSON response containing a list of image URLs.

    Raises:
        HTTPException: If the bucket is not found, raises a 404 error.
        HTTPException: If there is an error while generating URLs, raises a 500 error.
    """

    bucket = Buckets.find_one({"bucketId": bucket_id})
    if not bucket:
        raise HTTPException(status_code=404, detail=f"Bucket not found!")

    imageKeys = bucket.get("imageKeys", [])
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
def delete_bucket(bucketId: str, user=Depends(manager)):
    """
    Delete a bucket.

    Args:
        bucketId (str): The ID of the bucket to delete.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.

    Raises:
        HTTPException: If the bucket is not found or the user is not the owner of the bucket.

    """
    check_user(user)
    Buckets.delete_one({"bucketId": bucketId, "userId": user["id"]})

    PCINDEX.delete(ids=[bucketId], namespace="buckets")

    sourcesForBucket = Sources.find({"bucketId": bucketId})
    for source in sourcesForBucket:
        if source["type"] == "document":
            s3.delete_object(Bucket=s3_bucket.bucket_name, Key=source["url"])
        Sources.delete_one({"sourceId": source["sourceId"]})

    return {"result": "Bucket deleted"}


@router.patch("/update/{bucketId}")
def update_bucket(bucketId: str, config: UpdateBucket, user=Depends(manager)):
    """
    Update a bucket.

    Args:
        bucketId (str): The ID of the bucket to update.
        config (UpdateBucket): The new configuration for the bucket.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)
    bucket = Buckets.find_one({"bucketId": bucketId, "userId": user["id"]})
    if not bucket:
        raise HTTPException(status_code=404, detail="Bucket not found")

    update_fields = config.model_dump()
    update_fields["updated"] = datetime.now(UTC)

    vector_updates = {}
    if "name" in update_fields:
        vector_updates["name"] = update_fields["name"]
    if "description" in update_fields:
        vector_updates["description"] = update_fields["description"]

    if vector_updates:
        vectors = generate_bucket_embeddings(
            vector_updates["name"], vector_updates["description"]
        )
        PCINDEX.update(
            id=bucketId,
            values=vectors,
            set_metadata=update_fields,
            namespace="buckets",
        )

    result = Buckets.update_one(
        {"bucketId": bucketId, "userId": user["id"]}, {"$set": update_fields}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Bucket not found or no changes applied"
        )

    return {"result": "Bucket updated"}


@router.get("/id")
def get_bucket_by_id(bucketId: str, user=Depends(manager.optional)):
    """
    Retrieve a bucket by its ID.

    Args:
        bucketId (str): The ID of the bucket to retrieve.
        user (Optional[User]): The user making the request. Defaults to None.

    Returns:
        dict: A JSON response containing the bucket data if found.

    Raises:
        HTTPException: If the bucket is not found, raises a 404 error.
    """
    if user:
        check_user(user)

    bucket = Buckets.find_one({"bucketId": bucketId}, {"_id": 0})

    if not bucket:
        raise HTTPException(status_code=404, detail="Item not found")
    elif bucket["visibility"] == "Private" and user.get("id", "") != bucket["userId"]:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        return {"result": bucket}


@router.post("/like/{bucket_id}")
def like_bucket(bucket_id: str, user=Depends(manager)):
    """
    Like a bucket for a user.

    Args:
        bucket_id (str): The ID of the bucket to like.
        user (User): The user making the request.

    Raises:
        HTTPException: If the bucket is already liked or not found.

    Returns:
        dict: A JSON response with the updated number of likes for the bucket.
    """
    check_user(user)

    result = Buckets.find_one_and_update(
        {"bucketId": bucket_id, "likes": {"$ne": user["id"]}},
        {"$addToSet": {"likes": user["id"]}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Already liked or bucket not found")
    return {"result": len(result["likes"])}


@router.post("/unlike/{bucket_id}")
def unlike_bucket(bucket_id: str, user=Depends(manager)):
    """
    Unlike a bucket for a user.

    Args:
        bucket_id (str): The ID of the bucket to unlike.
        user (User): The user making the request.

    Raises:
        HTTPException: If the bucket is not liked yet or not found.

    Returns:
        dict: A JSON response with the updated number of likes for the bucket.
    """
    check_user(user)

    result = Buckets.find_one_and_update(
        {"bucketId": bucket_id, "likes": user["id"]},
        {"$pull": {"likes": user["id"]}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Not liked yet or bucket not found")
    return {"result": len(result["likes"])}


@router.get("/saved/user")
def get_user_saved_buckets(user=Depends(manager)):
    check_user(user)
    result = Buckets.find_one({"bucketId": {"$in": user["bucketsSaved"]}}, {"_id": 0})
    return {"result": result}


@router.patch("/add/tag/{bucket_id}/{tag}")
def add_tag(bucket_id: str, tag: str, user=Depends(manager)):
    check_user(user)

    formatted_tag = tag.lower()
    Buckets.update_one(
        {"bucketId": bucket_id, "userId": user["id"]},
        {"$addToSet": {"tags": formatted_tag}},
    )
    return {"result": "Tag added"}


@router.patch("/remove/tag/{bucket_id}/{tag}")
def remove_tag(bucket_id: str, tag: str, user=Depends(manager)):
    check_user(user)

    formatted_tag = tag.lower()
    Buckets.update_one(
        {"bucketId": bucket_id, "userId": user["id"]},
        {"$pull": {"tags": formatted_tag}},
    )
    return {"result": "Tag added"}


@router.post("/iterate/{bucket_id}")
def iterate_bucket(
    bucket_id: str, iteratePayload: IterateBucket, user=Depends(manager)
):
    """
    Iterate over a given bucket and create a new bucket with the same sources but with a new name and description.

    Args:
        bucket_id (str): The ID of the bucket to iterate over.
        iteratePayload (IterateBucket): The payload containing the new name and description for the new bucket.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the ID of the newly created bucket.

    Raises:
        HTTPException: If the bucket is not found, raises a 404 error.
        HTTPException: If user validation fails, raises a 401 error.
        HTTPException: If database operations fail, raises a 500 error with detailed message.
        HTTPException: If embedding generation fails, raises a 500 error.
    """
    check_user(user)

    bucketToIterate = Buckets.find_one({"bucketId": bucket_id})
    if not bucketToIterate:
        logger.warning(f"Bucket not found: {bucket_id}")
        raise HTTPException(status_code=404, detail=f"Bucket with ID {bucket_id} not found")
    
    associatedUser = Users.find_one({"id": bucketToIterate["userId"]}, {"_id": 0})
    if not associatedUser:
        logger.warning(f"User not found for bucket: {bucket_id}")
        raise HTTPException(status_code=404, detail="Owner of the bucket not found")

    try:
        newBucketId = str(uuid.uuid4())
        bucketToIterateSources = bucketToIterate.get("sourceIds", [])
        newSourceIds = set()
        proccessedSourceIds = set()
        
        # Process connections if included
        if iteratePayload.includeConnections:
            try:
                sources_to_insert = []
                connections_to_insert = []

                bucketToIterateConnections = list(Connections.find({"bucketId": bucket_id})) or []
                if not bucketToIterateConnections:
                    logger.info(f"No connections found for bucket {bucket_id}")
                
                for connectionToCopy in bucketToIterateConnections:
                    fromSourceIdToCopy, toSourceIdToCopy = connectionToCopy["fromSourceId"], connectionToCopy["toSourceId"]
                    proccessedSourceIds.add(fromSourceIdToCopy)
                    proccessedSourceIds.add(toSourceIdToCopy)
                 
                    fromSourceToCopy = Sources.find_one({"sourceId": fromSourceIdToCopy})
                    toSourceToCopy = Sources.find_one({"sourceId": toSourceIdToCopy})

                    if not fromSourceToCopy or not toSourceToCopy:
                        logger.warning(f"Warning: Connection {connectionToCopy.get('connectionId', 'unknown')} references nonexistent source(s). fromSource: {bool(fromSourceToCopy)}, toSource: {bool(toSourceToCopy)}")
                        continue

                    # Create new source IDs
                    newFromSourceId, newToSourceId = str(uuid.uuid4()), str(uuid.uuid4())
                    newSourceIds.add(newFromSourceId)
                    newSourceIds.add(newToSourceId)

                    # Prepare new from source
                    newFromSource : Source = {
                        "sourceId": newFromSourceId,
                        "bucketId": newBucketId,
                        "userId": user["id"],
                        "name": fromSourceToCopy["name"],
                        "content": (
                            fromSourceToCopy["content"]
                            if fromSourceToCopy["type"] != "document"
                            else None
                        ),
                        "url": fromSourceToCopy["url"],
                        "type": fromSourceToCopy["type"],
                        "size": fromSourceToCopy["size"],
                        "created": datetime.now(UTC),
                        "updated": datetime.now(UTC),
                    }

                    # Prepare new to source
                    newToSource : Source = {
                        "sourceId": newToSourceId,
                        "bucketId": newBucketId,
                        "userId": user["id"],
                        "name": toSourceToCopy["name"],
                        "content": (
                            toSourceToCopy["content"]
                            if toSourceToCopy["type"] != "document"
                            else None
                        ),
                        "url": toSourceToCopy["url"],
                        "type": toSourceToCopy["type"],
                        "size": toSourceToCopy["size"],
                        "created": datetime.now(UTC),
                        "updated": datetime.now(UTC),
                    }

                    # Prepare new connection
                    newConnectionId = str(uuid.uuid4())
                    newConnection : ConnectionType = {
                        "connectionId": newConnectionId,
                        "bucketId": newBucketId,
                        "data" : {
                            "description" : connectionToCopy.get("description", "")
                        },
                        "fromSourceId": newFromSourceId,
                        "toSourceId": newToSourceId,
                        "created": datetime.now(UTC),
                        "updated": datetime.now(UTC), 
                    }
                    sources_to_insert.extend([newFromSource, newToSource])
                    connections_to_insert.append(newConnection)

                # Insert new sources and connections
                if sources_to_insert:
                    try:
                        Sources.insert_many(sources_to_insert)
                        logger.debug(f"Inserted {len(sources_to_insert)} connected sources")
                    except Exception as e:
                        logger.error(f"Failed to insert connected sources: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Failed to insert connected sources: {str(e)}")
                
                if connections_to_insert:
                    try:
                        Connections.insert_many(connections_to_insert)
                        logger.debug(f"Inserted {len(connections_to_insert)} connections")
                    except Exception as e:
                        logger.error(f"Failed to insert connections: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Failed to insert connections: {str(e)}")

                # Process standalone sources
                standAloneSourceIds = set(bucketToIterateSources) - proccessedSourceIds
                if standAloneSourceIds:
                    logger.debug(f"Processing {len(standAloneSourceIds)} standalone sources")
                    standAloneSourcesToInsert = []
                    for standAloneSourceId in standAloneSourceIds:
                        sourceToCopy = Sources.find_one({"sourceId": sourceId})
                        if not sourceToCopy:
                            logger.warning(f"Standalone source {sourceId} not found, skipping")
                            continue

                        newSourceId = str(uuid.uuid4())
                        newSourceIds.add(newSourceId)
                        sourceToInsert : Source = {
                            "sourceId": newSourceId,
                            "bucketId": newBucketId,
                            "userId": user["id"],
                            "name": sourceToCopy["name"],
                            "content": (
                                sourceToCopy["content"]
                                if sourceToCopy["type"] != "document"
                                else None
                            ),
                            "url": sourceToCopy["url"],
                            "type": sourceToCopy["type"],
                            "size": sourceToCopy["size"],
                            "created": datetime.now(UTC),
                            "updated": datetime.now(UTC),
                        }
                        standAloneSourcesToInsert.append(sourceToInsert)

                    if standAloneSourcesToInsert:
                        try:
                            Sources.insert_many(standAloneSourcesToInsert)
                            logger.debug(f"Inserted {len(standAloneSourcesToInsert)} standalone sources")
                        except Exception as e:
                            logger.error(f"Failed to insert standalone sources: {str(e)}")
                            raise HTTPException(status_code=500, detail=f"Failed to insert standalone sources: {str(e)}")
            except Exception as e:
                if isinstance(e, HTTPException):
                    raise e
                logger.error(f"Error processing connections: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing connections: {str(e)}")
        else:
            # Process without connections
            try:
                logger.debug(f"Processing sources without connections")
                newSources = []
                for sourceId in bucketToIterateSources:
                    sourceToCopy = Sources.find_one({"sourceId": sourceId})
                    if not sourceToCopy:
                        logger.warning(f"Source {sourceId} not found, skipping")
                        continue

                    newSourceId = str(uuid.uuid4())
                    sourceToInsert : Source = {
                        "sourceId": newSourceId,
                        "bucketId": newBucketId,
                        "userId": user["id"],
                        "name": sourceToCopy["name"],
                        "content": (
                            sourceToCopy["content"]
                            if sourceToCopy["type"] != "document"
                            else None
                        ),
                        "url": sourceToCopy["url"],
                        "type": sourceToCopy["type"],
                        "size": sourceToCopy["size"],
                        "created": datetime.now(UTC),
                        "updated": datetime.now(UTC),
                    }
                    newSources.append(sourceToInsert)
                    newSourceIds.add(newSourceId)

                if newSources:
                    try:
                        Sources.insert_many(newSources)
                        logger.debug(f"Inserted {len(newSources)} sources (no connections)")
                    except Exception as e:
                        logger.error(f"Failed to insert sources (no connections): {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Failed to insert sources: {str(e)}")
            except Exception as e:
                if isinstance(e, HTTPException):
                    raise e
                logger.error(f"Error processing sources without connections: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing sources: {str(e)}")

        # Create the new bucket
        bucket_to_insert : Bucket = {
            "bucketId": newBucketId,
            "name": iteratePayload.name,
            "description": iteratePayload.description if hasattr(iteratePayload, 'description') else "",
            "userId": user["id"],
            "sourceIds": list(newSourceIds),
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
            "visibility": "Private",
            "tags": bucketToIterate.get("tags", []),
            "iteratedFrom": associatedUser["id"],
            "likes": [],
            "iterations": [],
        }

        # Generate embeddings for Pinecone
        try:
            vectors = generate_bucket_embeddings(iteratePayload.name, bucket_to_insert["description"])
            logger.debug(f"Generated bucket embeddings successfully")
            
            # Insert into Pinecone
            pincone_insert = bucket_to_insert.copy()
            pincone_insert["created"] = str(bucket_to_insert["created"])
            pincone_insert["updated"] = str(bucket_to_insert["updated"])
            embedding_data = [(newBucketId, vectors, pincone_insert)]
            
            try:
                PCINDEX.upsert(
                    vectors=embedding_data,
                    namespace="buckets",
                )
                logger.debug(f"Upserted bucket data to Pinecone")
            except Exception as e:
                logger.error(f"Pinecone upsert error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to store vector embeddings: {str(e)}")
        except Exception as e:
            logger.error(f"Embedding generation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {str(e)}")

        # Insert the new bucket into the database
        try:
            Buckets.insert_one(bucket_to_insert)
            logger.debug(f"Inserted new bucket {newBucketId}")
        except Exception as e:
            logger.error(f"Failed to insert new bucket: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to insert new bucket: {str(e)}")

        # Update the original bucket's iterations
        try:
            update_result = Buckets.find_one_and_update(
                {"bucketId": bucketToIterate["bucketId"]},
                {"$push": {"iterations": user["id"]}},
            )
            if not update_result:
                logger.warning(f"Failed to update iterations for original bucket {bucket_id}")
        except Exception as e:
            logger.error(f"Failed to update original bucket iterations: {str(e)}")
            # Don't raise exception here as the main operation succeeded

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Unexpected error in bucket iteration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bucket iteration failed: {str(e)}")

    logger.info(f"Successfully iterated bucket {bucket_id} to new bucket {newBucketId}")
    return {"result": newBucketId}


@router.get("/search")
def search_buckets(
    query: str,
    visibility: Optional[Literal["Public", "Private"]] = Query(
        None, alias="visibility"
    ),
    userId: Optional[str] = None,
    bucketId: Optional[str] = None,
    user=Depends(manager.optional),
):
    if user:
        check_user(user)

    filter = {}
    if visibility:
        filter["visibility"] = {"$eq": visibility}
    if userId:
        filter["userId"] = {"$eq": userId}
    if bucketId:
        filter["bucketId"] = {"$eq": bucketId}

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
