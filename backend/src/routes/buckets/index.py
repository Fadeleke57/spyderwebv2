from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel, HttpUrl
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends, Query
from typing import Optional
import os
from werkzeug.utils import secure_filename
import uuid
from src.lib.s3.index import S3Bucket
from pytz import UTC
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.models.user import User
from datetime import datetime
from src.models.bucket import BucketConfig, UpdateBucket, IterateBucket
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from src.lib.logger.index import logger
from pymongo import ReturnDocument
from src.core.config import settings
import boto3
from urllib.parse import urlparse
router = APIRouter()

s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3 = boto3.client('s3')
@router.get("/all/user")
def get_user_buckets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    criteria: Optional[str] = None,
    user: User = Depends(manager)
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

    if criteria:
        if criteria == "public":
            visibility = "Public"
        elif criteria == "private":
            visibility = "Private"
        else:
            visibility = None
    else:
        visibility = None

    buckets = get_collection("buckets")
    if visibility:
        buckets = buckets.find({"visibility": visibility, "userId": user["id"]}, {"_id": 0})
    else:
        buckets = buckets.find({"userId": user["id"]}, {"_id": 0})
    buckets = [bucket for bucket in buckets]
    buckets = sorted(buckets, key=lambda x: x["updated"], reverse=True)

    #pagination
    total_buckets = len(buckets)
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_buckets = buckets[start_index:end_index]

    next_cursor = page + 1 if end_index < total_buckets else None
    prev_cursor = page - 1 if page > 1 else None
    print("next_cursor", next_cursor)
    print("prev_cursor", prev_cursor)
    return {
        "items": paginated_buckets,
        "total": total_buckets,
        "page": page,
        "page_size": page_size,
        "nextCursor": next_cursor,
        "prevCursor": prev_cursor,
    }

@router.get("/all/public") #get all public buckets
def get_public_buckets():
    """
    Retrieve all public buckets.

    Returns:
    -------
    List of Bucket
        List of all public buckets
    """
    buckets = get_collection("buckets")
    buckets = buckets.find({"visibility": "Public"}, {"_id": 0})
    buckets = sorted(buckets, key=lambda x: x["updated"], reverse=True)
    return {"result": buckets}

@router.get("/liked/user") #get all liked buckets belonging to a user
def get_user_liked_buckets(user: User = Depends(manager)):
    """
    Retrieve all buckets liked by a user.

    Args:
        user (User): The user whose liked buckets are to be retrieved.

    Returns:
        dict: A JSON response containing a list of liked buckets sorted by creation date in descending order.
    """
    check_user(user)
    buckets = get_items_by_field("buckets", "likes", user["id"])
    buckets = [bucket for bucket in buckets]
    buckets = sorted(buckets, key=lambda x: x["created"], reverse=True)
    return {"result": buckets}

@router.post("/create")
def create_bucket(config : BucketConfig, user=Depends(manager)):
    """
    Create a new bucket.

    Args:
        config (BucketConfig): The configuration for the new bucket.
        user (User): The user creating the bucket.

    Returns:
        dict: A JSON response with a result key containing the ID of the new bucket.
    """
    check_user(user)
    bucket = get_collection("buckets")
    bucketId = str(uuid.uuid4())
    bucket.insert_one({
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
        "iteratedFrom": None
    })
    return {"result": bucketId}

@router.post("/upload/image/{bucket_id}")
async def upload_file(
    bucket_id: str, 
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user=Depends(manager)
):
    
    check_user(user)
    uploaded_keys = []

    try:
        for file in files:
            #sanitize filename
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

                uploaded_keys.append(object_name)

                buckets = get_collection("buckets")
                result = buckets.update_one(
                    {
                        "bucketId": bucket_id,
                        "userId": user["id"]
                    },
                    {
                        "$push": {"imageKeys": object_name},
                        "$set": {"updated_at": datetime.now(UTC)}
                    }
                )

                if result.modified_count == 0:
                    raise HTTPException(status_code=404, detail="Bucket not found")

            except Exception as e:
                logger.error(f"Error uploading file {safe_filename}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
            finally:
                #clean up
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        return {"imageKeys": uploaded_keys}

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/image/{bucket_id}/{image_name}")
def delete_image(
    bucket_id: str, 
    image_name: str,
    user=Depends(manager)
):
    check_user(user)

    buckets = get_collection("buckets")

    filepath = f"files/{user['id']}/{bucket_id}/images/{image_name}"

    result = buckets.update_one(
        {
            "bucketId": bucket_id,
            "userId": user["id"],
            "imageKeys": filepath
        },
        {
            "$pull": {"imageKeys": filepath},
            "$set": {"updated_at": datetime.now(UTC)}
        }
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bucket not found")
    
    s3.delete_object(
        Bucket=s3_bucket.bucket_name,
        Key=filepath
    )
    return {"result": "Image deleted"}
    
@router.get("/images/bucket/{bucket_id}")
def get_bucket_images(bucket_id : str):
    Buckets = get_collection("buckets")
    bucket = Buckets.find_one({"bucketId": bucket_id})
    if not bucket:
        raise HTTPException(status_code=404, detail=f"Bucket not found!")

    imageKeys = bucket.get("imageKeys", [])
    urls = []
    try:
        for key in imageKeys:
            url = s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': s3_bucket.bucket_name,
                    'Key': key,
                    'ResponseContentDisposition': 'inline',
                },
                ExpiresIn=604800
            )
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
    buckets= get_collection("buckets")
    buckets.delete_one({"bucketId": bucketId, "userId": user["id"]})

    sources = get_collection("sources")
    sourcesForBucket = sources.find({"bucketId": bucketId})
    for source in sourcesForBucket:
        if source["type"] == "document":
            s3.delete_object(Bucket=s3_bucket.bucket_name, Key=source["url"])
            sources.delete_one({"sourceId": source["sourceId"]})

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
    buckets= get_collection("buckets")
    buckets.update_one({"bucketId": bucketId, "userId": user["id"]}, {"$set": config.model_dump()})
    buckets.update_one({"bucketId": bucketId, "userId": user["id"]}, {"$set": {"updated": datetime.now(UTC)}})
    return {"result": "Bucket updated"}

@router.get("/id")
def get_bucket_by_id(bucketId : str, user=Depends(manager.optional)):
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
    buckets = get_collection("buckets")
    bucket = buckets.find_one({"bucketId" : bucketId}, {"_id": 0})

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
    buckets = get_collection("buckets")
    result = buckets.find_one_and_update(
        {"bucketId": bucket_id, "likes": {"$ne": user["id"]}},
        {"$addToSet": {"likes": user["id"]}},
        return_document=ReturnDocument.AFTER
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
    buckets = get_collection("buckets")
    result = buckets.find_one_and_update(
        {"bucketId": bucket_id, "likes": user["id"]},
        {"$pull": {"likes": user["id"]}}, 
        return_document=ReturnDocument.AFTER
    )
    if not result:
        raise HTTPException(status_code=400, detail="Not liked yet or bucket not found")
    return {"result": len(result["likes"])}

@router.patch("/add/tag/{bucket_id}/{tag}")
def add_tag(bucket_id: str, tag: str, user=Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    formatted_tag = tag.lower()
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$addToSet": {"tags": formatted_tag}})
    return {"result": "Tag added"}
    
@router.patch("/remove/tag/{bucket_id}/{tag}")
def remove_tag(bucket_id: str, tag: str, user=Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    formatted_tag = tag.lower()
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$pull": {"tags": formatted_tag}})
    return {"result": "Tag added"}

@router.post("/iterate/{bucket_id}")
def iterate_bucket(bucket_id: str, iteratePayload: IterateBucket, user=Depends(manager)):
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
    """
    check_user(user)
    buckets = get_collection("buckets")
    sources = get_collection("sources")
    users = get_collection("users")

    bucketToIterate = buckets.find_one({"bucketId": bucket_id})
    associatedUser = users.find_one({"id": bucketToIterate["userId"]}, {"_id": 0})

    if not bucketToIterate or not associatedUser:
        raise HTTPException(status_code=404, detail="Bucket or owner not found")
    
    newBucketId = str(uuid.uuid4())
    newSourceIds = []
    bucketToIterateSources = bucketToIterate.get("sourceIds", [])
    for sourceId in bucketToIterateSources:

        sourceToCopy = sources.find_one({"sourceId": sourceId})
        if not sourceToCopy:
            continue

        newSourceId = str(uuid.uuid4())

        sourceToInsert = {
            "sourceId": newSourceId,
            "bucketId": newBucketId,
            "userId": user["id"],
            "name": sourceToCopy["name"],
            "content": sourceToCopy["content"] if sourceToCopy["type"] != "document" else None,
            "url": sourceToCopy["url"],
            "type": sourceToCopy["type"],
            "size": sourceToCopy["size"],
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }
        sources.insert_one(sourceToInsert)
        newSourceIds.append(newSourceId)
    
    buckets.insert_one({
        "bucketId": newBucketId,
        "name": iteratePayload.name,
        "description": iteratePayload.description,
        "userId": user["id"],
        "articleIds": bucketToIterate["articleIds"],
        "sourceIds": newSourceIds,
        "created": datetime.now(UTC),
        "updated": datetime.now(UTC),
        "visibility": "Private",
        "tags": bucketToIterate["tags"],
        "iteratedFrom": associatedUser["id"],
        "likes": [],
        "iterations": [],
    })

    buckets.find_one_and_update({"bucketId": bucketToIterate["bucketId"]}, {"$push": {"iterations": user["id"]}})

    return {"result": newBucketId}


@router.get("/popular") 
def get_popular_buckets():
    buckets = get_collection("buckets")
    buckets = buckets.find({"visibility": "Public"}, {"_id": 0})
    buckets = sorted(buckets, key=lambda x: len(x["likes"]), reverse=True)
    buckets = buckets[:3]
    return {"result": buckets}