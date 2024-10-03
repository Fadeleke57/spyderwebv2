from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import uuid
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.models.article import Article
from src.models.user import User
router = APIRouter()
from datetime import datetime
from src.models.bucket import BucketConfig
from fastapi.exceptions import HTTPException
@router.get("/all/user") # get all buckets belonging to a user
def get_user_buckets(user: User = Depends(manager)):
    check_user(user)
    buckets = get_items_by_field("buckets", "userId", user["id"])
    buckets = [bucket for bucket in buckets]
    buckets = sorted(buckets, key=lambda x: x["created"], reverse=True)
    return {"result": buckets}

@router.get("/all/public") # get all public buckets
def get_public_buckets():
    buckets = get_items_by_field("buckets", "private", False)
    buckets = [bucket for bucket in buckets]
    buckets = sorted(buckets, key=lambda x: x["created"], reverse=True)
    return {"result": buckets}

@router.post("/create")
def create_bucket(config : BucketConfig, user=Depends(manager)):
    check_user(user)
    bucket = get_collection("buckets")
    bucket.insert_one({
        "bucketId": str(uuid.uuid4()),
        "name": config.name,
        "description": config.description,
        "userId": user["id"],
        "articleIds": config.articleIds,
        "created": datetime.now(),
        "updated": datetime.now(),
        "private": config.private,
        "tags": config.tags
    })
    return {"result": "Bucket created"}

@router.delete("/delete")
def delete_bucket(bucketId: str, user=Depends(manager)):
    check_user(user)
    buckets= get_collection("buckets")
    buckets.delete_one({"bucketId": bucketId, "userId": user["id"]})
    return {"result": "Bucket deleted"}

@router.put("/update")
def update_bucket(config : BucketConfig, bucketId : str, user=Depends(manager)):
    check_user(user)
    buckets= get_collection("buckets")
    buckets.update_one({"bucketId": bucketId, "userId": user["id"]}, {"$set": {"name": config.name, "description": config.description, "private": config.private}})
    return {"result": "Bucket updated"}

@router.get("/id")
def get_bucket_by_id(bucketId : str, user=Depends(manager)):
    check_user(user)
    buckets=get_collection("buckets")
    bucket = buckets.find_one({"bucketId" : bucketId}, {"_id": 0})
    if bucket:
        print("Bucket found",bucket)
    if not bucket:
        raise HTTPException(status_code=404, detail="Item not found")
    else: 
        return {"result": bucket}