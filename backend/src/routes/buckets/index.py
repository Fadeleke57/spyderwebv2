from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends, Query
from typing import Optional
import uuid
from src.lib.s3.index import S3Bucket
from pytz import UTC
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.models.user import User
from datetime import datetime
from src.models.bucket import BucketConfig, UpdateBucket
from fastapi.exceptions import HTTPException
from src.utils.graph import get_articles_by_ids
from pymongo import ReturnDocument
from src.core.config import settings
import boto3
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

    # Fetch all buckets for the user
    buckets = get_collection("buckets")
    if visibility:
        buckets = buckets.find({"visibility": visibility, "userId": user["id"]}, {"_id": 0})
    else:
        buckets = buckets.find({"userId": user["id"]}, {"_id": 0})
    buckets = [bucket for bucket in buckets]
    buckets = sorted(buckets, key=lambda x: x["created"], reverse=True)

    # Pagination logic
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

@router.get("/all/public") # get all public buckets
def get_public_buckets():
    """
    Retrieve all public buckets.

    Returns:
    -------
    List of Bucket
        List of all public buckets
    """
    buckets = get_items_by_field("buckets", "visibility", "Public")
    buckets = [bucket for bucket in buckets]
    buckets = sorted(buckets, key=lambda x: x["created"], reverse=True)
    return {"result": buckets}

@router.get("/liked/user") # get all liked buckets belonging to a user
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
        "articleIds": config.articleIds,
        "sourceIds": config.sourceIds or [],
        "created": datetime.now(UTC),
        "updated": datetime.now(UTC),
        "visibility": config.visibility,
        "tags": config.tags,
        "likes": [],
        "iterations": [],
    })
    return {"result": bucketId}

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
    buckets=get_collection("buckets")
    bucket = buckets.find_one({"bucketId" : bucketId}, {"_id": 0})
    if bucket:
        print("Bucket found",bucket)
    if not bucket:
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

@router.patch("/add/source/{bucket_id}/{source_id}")
def add_article(bucket_id: str, source_id: str, user=Depends(manager)):
    """
    Add a source to a bucket.

    Args:
        bucket_id (str): The ID of the bucket.
        source_id (str): The ID of the source to add.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$push": {"articleIds": source_id}})
    return {"result": True}

@router.patch("/remove/source/{bucket_id}/{source_id}")
def remove_article(bucket_id: str, source_id: str, user=Depends(manager)):
    """
    Remove a source from a bucket.

    Args:
        bucket_id (str): The ID of the bucket.
        source_id (str): The ID of the source to remove.
        user (User): The user making the request.

    Returns:
        dict: A JSON response of the form {"result": True} if the source was removed, or 404 if the bucket or source does not exist.
    """
    check_user(user)
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$pull": {"sourceIds": source_id}})
    return {"result": True}

@router.get("/sources/{bucket_id}")
def get_articles(bucket_id: str, user=Depends(manager.optional)):
    """
    Retrieve articles for a given bucket.

    Args:
        bucket_id (str): The ID of the bucket to retrieve articles from.
        user (User, optional): The user making the request. Defaults to None.

    Returns:
        dict: A JSON response containing the articles associated with the given bucket ID.
              Raises 404 error if the bucket is not found.
    """
    if user:
        check_user(user)
    buckets = get_collection("buckets")
    bucket = buckets.find_one({"bucketId": bucket_id})
    if not bucket:
        raise HTTPException(status_code=404, detail="Bucket not found")
    articleIds = bucket["sourceIds"]
    articles = get_articles_by_ids(articleIds)
    print("Found length of articles: ", len(articles))
    return {"result": articles}