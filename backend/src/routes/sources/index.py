from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from src.models.source import Source
from src.routes.auth.oauth2 import manager
from src.utils.exceptions import check_user
from src.lib.s3.index import S3Bucket
from src.db.mongodb import get_collection, insert_item
from uuid import uuid4
from datetime import datetime
from src.core.config import settings
import requests
from pydantic import BaseModel, HttpUrl
from bs4 import BeautifulSoup
from src.models.note import CreateNote, UpdateNote
import boto3
from botocore.exceptions import ClientError
from src.agents.structure_html_agent import process_html
import os

router = APIRouter()
s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3 = boto3.client('s3')

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

class UrlRequest(BaseModel):
    url: HttpUrl

@router.post("/website/{web_id}")
def add_website(web_id: str, url: UrlRequest, user=Depends(manager)):
    """
    Add a website source to a specified web (bucket).

    This function retrieves the content of a webpage from the provided URL, processes the HTML to extract structured data,
    and stores it as a Source document in the database. The source is then added to the specified web (bucket).

    Args:
        web_id (str): The ID of the web (bucket) to add the source to.
        url (str): The URL of the website to add.
        user (User): The user making the request.

    Raises:
        HTTPException: If the webpage cannot be retrieved or parsed.

    Returns:
        dict: A JSON response containing the structured data of the webpage.
    """
    check_user(user)
    
    try:
        response = requests.get(url.url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail="Could not retrieve the webpage")
  
    soup = BeautifulSoup(response.content, "html.parser")
    main_content = soup.get_text()  

    try: 
        structured_data = process_html(main_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not parse the webpage")

    sources = get_collection("sources")
    sourceId = str(uuid4())
    sources.insert_one({
        "sourceId": sourceId,
        "bucketId": web_id,
        "name": structured_data["title"],
        "url": str(url.url),
        "type": "website",
        "size": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    })
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": web_id, "userId": user["id"]}, {"$push": {"sourceIds": sourceId}})
    return {"result": structured_data}


"""
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
"""

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

@router.get("/presigned/url/{file_path:path}")
async def get_presigned_url(file_path: str):
    
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': s3_bucket.bucket_name,
                'Key': file_path,
                'ResponseContentDisposition': 'inline',
                'ResponseContentType': 'application/pdf'
            },
            ExpiresIn=3600
        )
        return {"presigned_url": url}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/upload/note/{bucket_id}/")
def upload_note(bucket_id: str, note: CreateNote, user=Depends(manager)):
    """
    Upload a note to a given bucket.

    Args:
        bucket_id (str): The ID of the bucket to upload the note to.
        note (CreateNote): The content of the note.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the ID of the uploaded note.
    """
    check_user(user)
    sources = get_collection("sources")
    sourceId = str(uuid4())
    sources.insert_one({
        "sourceId": sourceId,
        "bucketId": bucket_id,
        "name": note.title,
        "content": note.content,
        "url": None,
        "type": "note",
        "size": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    })
    buckets = get_collection("buckets")
    buckets.update_one({"bucketId": bucket_id, "userId": user["id"]}, {"$push": {"sourceIds": sourceId}})
    return {"result": sourceId}


@router.patch("/update/note/{bucket_id}/{source_id}")
def update_note(bucket_id: str, source_id: str, note: UpdateNote, user=Depends(manager)):
    """
    Update a note.

    Args:
        bucket_id (str): The ID of the bucket the note belongs to.
        source_id (str): The ID of the note to update.
        note (UpdateNote): The new content for the note.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)
    sources = get_collection("sources")
    sources.update_one({"sourceId": source_id, "bucketId": bucket_id, "userId": user["id"]}, {"$set": {"content": note.content, "updated_at": datetime.now()}})
    return {"result": "Note updated"}