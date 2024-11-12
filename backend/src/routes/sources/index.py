from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from src.models.source import Source
from src.routes.auth.oauth2 import manager
from src.utils.exceptions import check_user
from src.lib.s3.index import S3Bucket
from src.db.mongodb import get_collection, insert_item
from uuid import uuid4
from datetime import datetime
from src.core.config import settings
import os

router = APIRouter()
s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)

@router.post("/upload/{user_id}/{web_id}/{file_type}")
async def upload_file(user_id: str, web_id: str, file_type: str, file: UploadFile = File(...), user=Depends(manager)):
    """
    Uploads a file to S3 and creates a Source document in the database.

    Args:
        user_id (str): The ID of the user making the request.
        web_id (str): The ID of the web (bucket) to upload to.
        file_type (str): The type of file being uploaded (e.g. image, document).
        file (UploadFile): The file to upload.

    Returns:
        dict: A JSON response with a result key containing a success message.

    Raises:
        HTTPException: If the upload fails.
    """
    check_user(user)

    object_name = f"files/{user_id}/{web_id}/{file_type}/{file.filename.replace(' ', '_')}"

    # save file to temp location
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        # upload to S3
        s3_bucket.upload_file(temp_path, object_name)
        sources = get_collection("sources")
        sourceId = str(uuid4())
        sources.insert_one({
            "sourceId": sourceId,
            "bucketId": web_id,
            "name": file.filename,
            "url": object_name,
            "type": file_type,
            "size": os.path.getsize(temp_path),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        })
        buckets = get_collection("buckets")
        buckets.update_one({"bucketId": web_id, "userId": user_id}, {"$push": {"sourceIds": sourceId}})

        return {"result": f"File uploaded to {temp_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # remove temp file
        os.remove(temp_path)

@router.get("/download")
def download_file(user=Depends(manager)):
    check_user(user)
    return {"result": "File downloaded"}

@router.delete("/delete")
def delete_file(user=Depends(manager)):
    check_user(user)
    return {"result": "File deleted"}

@router.get("/list")
def list_files(user=Depends(manager)):
    check_user(user)
    return {"result": "Files listed"}

@router.get("/all/{web_id}")
def get_all_sources(web_id: str):
    """
    Retrieve all sources associated with a given web ID.

    Args:
        web_id (str): The ID of the web (bucket) to retrieve sources from.

    Returns:
        dict: A JSON response containing a list of sources associated with the given web ID.
    """
    sources = get_collection("sources")
    sourcesForWeb = sources.find({"bucketId": web_id}, {"_id": 0})
    return {"result": list(sourcesForWeb)}