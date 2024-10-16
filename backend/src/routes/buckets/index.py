from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
import uuid
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.models.article import Article
from src.models.user import User
router = APIRouter()
from datetime import datetime
from src.models.bucket import BucketConfig, UpdateBucket
from fastapi.exceptions import HTTPException
from src.utils.graph import get_articles_by_ids
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exception_handlers import request_validation_exception_handler
from pydantic import ValidationError
from pymongo import ReturnDocument

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

@router.get("/liked/user") # get all liked buckets belonging to a user
def get_user_liked_buckets(user: User = Depends(manager)):
    check_user(user)
    buckets = get_items_by_field("buckets", "likes", user["id"])
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
        "tags": config.tags,
        "likes": [],
        "iterations": [],
    })
    return {"result": "Bucket created"}

@router.delete("/delete")
def delete_bucket(bucketId: str, user=Depends(manager)):
    check_user(user)
    buckets= get_collection("buckets")
    buckets.delete_one({"bucketId": bucketId, "userId": user["id"]})
    return {"result": "Bucket deleted"}

@router.patch("/update/{bucketId}")
def update_bucket(bucketId: str, config: UpdateBucket, user=Depends(manager)):
    check_user(user)
    buckets= get_collection("buckets")
    buckets.update_one({"bucketId": bucketId, "userId": user["id"]}, {"$set": config.model_dump()})
    buckets.update_one({"bucketId": bucketId, "userId": user["id"]}, {"$set": {"updated": datetime.now()}})
    return {"result": "Bucket updated"}

@router.get("/id")
def get_bucket_by_id(bucketId : str, user=Depends(manager.optional)):
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
    print("Tag is ", tag)
    check_user(user)
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$push": {"tags": tag}})
    return {"result": True}

@router.patch("/remove/tag/{bucket_id}/{tag}")
def remove_tag(bucket_id: str, tag: str, user=Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$pull": {"tags": tag}})
    return {"result": True}

@router.patch("/add/article/{bucket_id}/{article_id}")
def add_article(bucket_id: str, article_id: str, user=Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$push": {"articleIds": article_id}})
    return {"result": True}

@router.patch("/remove/article/{bucket_id}/{article_id}")
def remove_article(bucket_id: str, article_id: str, user=Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$pull": {"articleIds": article_id}})
    return {"result": True}

@router.get("/articles/{bucket_id}")
def get_articles(bucket_id: str, user=Depends(manager)):
    check_user(user)
    buckets = get_collection("buckets")
    bucket = buckets.find_one({"bucketId": bucket_id, "userId": user["id"]})
    if not bucket:
        raise HTTPException(status_code=404, detail="Bucket not found")
    articleIds = bucket["articleIds"]
    articles = get_articles_by_ids(articleIds)
    return {"result": articles}