from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks
from src.models.source import Source, UpdateSource
from src.models.web import Webs
from src.routes.auth.oauth2 import manager
from src.utils.exceptions import check_user
import tempfile
from src.lib.s3.index import S3Bucket
from src.db.mongodb import get_collection
from src.service.source import service as sourceService
from src.db.neo4j import client as neo4jClient
from src.core.config import settings
from uuid import uuid4
from werkzeug.utils import secure_filename
from datetime import datetime
from src.core.config import settings
from src.utils.youtube import get_video_transcript, get_video_info
from pydantic import BaseModel, HttpUrl
from src.lib.firecrawl.index import client as firecrawlClient
from src.models.source import CreateNote, UpdateNote
from typing import List
import boto3
from urllib.parse import unquote
from src.lib.logger.index import logger
from botocore.exceptions import ClientError
from pytz import UTC
import os
from src.lib.pinecone.index import client as pineconeClient
from src.models.process import create_process, update_process

router = APIRouter()
s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3 = boto3.client("s3")


async def process_file(
    user_id: str,
    web_id: str,
    job_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Uploads a file to S3 and creates a Source document in the database.

    Args:
        user_id (str): The ID of the user making the request.
        web_id (str): The ID of the web (web) to upload to.
        file_type (str): The type of file being uploaded (e.g. image, document).
        file (UploadFile): The file to upload.

    Returns:
        dict: A JSON response with a result key containing a success message.

    Raises:
        HTTPException: If the upload fails.
    """
    file_type = file.filename.split(".")[-1].lower()
    if file_type not in {"pdf", "txt", "md"}:
        return None

    temp_dir = tempfile.gettempdir()  # gets system temp directory (cross-platform)
    temp_path = os.path.join(temp_dir, file.filename)

    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        sourceId = str(uuid4())
        if file_type == "pdf":
            object_name = f"files/{user_id}/{web_id}/document/{uuid4()}_{file.filename.replace(' ', '_')}"
            # upload to S3
            s3_bucket.upload_file(temp_path, object_name)
            sourceToInsert: Source = {
                "sourceId": sourceId,
                "webId": web_id,
                "userId": user_id,
                "name": file.filename,
                "content": None,
                "url": object_name,
                "type": "document",
                "size": os.path.getsize(temp_path),
                "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            }

            background_tasks.add_task(
                sourceService.embed_and_upsert_pdf,
                sourceId,
                temp_path,
                web_id,
                object_name,
            )

        elif file_type in {"txt", "md"}:
            with open(temp_path, "r", encoding="utf-8") as f:
                text_content = f.read()

                filename = (" ".join(file.filename.split(".")[:-1])).replace("%22", " ")
                sourceToInsert: Source = {
                    "sourceId": sourceId,
                    "webId": web_id,
                    "userId": user_id,
                    "name": filename,
                    "content": text_content,
                    "url": None,
                    "type": "note",
                    "size": os.path.getsize(temp_path),
                    "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                    "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
            os.remove(temp_path)
            background_tasks.add_task(
                sourceService.embed_and_upsert_note,
                sourceId,
                text=text_content,
                web_id=web_id,
                title=filename,
            )

        neo4jClient.create_node("source", sourceToInsert)
        Webs.update_one(
            {"webId": web_id, "userId": user_id},
            {
                "$push": {"sourceIds": sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
        )
        return sourceToInsert

    except Exception as e:
        update_process(job_id=job_id, status="failed", percentage=0, error=str(e))
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/files/{web_id}")
async def upload_files(
    web_id: str,
    background_tasks: BackgroundTasks,
    preserve_obsidian_links: bool,
    files: List[UploadFile] = File(...),
    user=Depends(manager),
):
    """
    Upload multiple files to a web.

    Args:
        web_id (str): The ID of the web to upload to.
        preserve_obsidian_links (bool): Whether to preserve Obsidian links (default: False).
        files (List[UploadFile]): The files to upload.

    Returns:
        dict: A JSON response with a result key containing the ID of the first uploaded source, and a process key containing the ID of the background process.
    """
    check_user(user)
    job_id = create_process(
        web_id=web_id, type="upload", description=f"Uploading {len(files)} files..."
    )

    if not files:
        update_process(
            job_id=job_id, status="failed", percentage=0, error="No files uploaded."
        )
        raise HTTPException(status_code=400, detail="No files uploaded.")

    sources = []
    for file in files:
        result = await process_file(
            user_id=user["id"],
            web_id=web_id,
            job_id=job_id,
            background_tasks=background_tasks,
            file=file,
        )

        if result:
            sources.append(result)

        update_process(
            job_id=job_id,
            status="processing",
            percentage=((len(sources) / len(files)) * 100),
        )

    if preserve_obsidian_links:
        logger.info("Parsing Obsidian links...")
        background_tasks.add_task(sourceService.parse_obsidian_links, web_id, sources)

    update_process(job_id=job_id, status="completed", percentage=100)
    return {"result": sources[0]["sourceId"] if sources else None, "process": job_id}


class UrlRequest(BaseModel):
    url: HttpUrl


@router.post("/website/{web_id}")
def add_website(
    web_id: str,
    url: UrlRequest,
    background_tasks: BackgroundTasks,
    user=Depends(manager),
):
    """
    Add a website source to a specified web (web).

    This function retrieves the content of a webpage from the provided URL, processes the HTML to extract structured data,
    and stores it as a Source document in the database. The source is then added to the specified web (web).

    Args:
        web_id (str): The ID of the web (web) to add the source to.
        url (str): The URL of the website to add.
        user (User): The user making the request.

    Raises:
        HTTPException: If the webpage cannot be retrieved or parsed.

    Returns:
        dict: A JSON response containing the structured data of the webpage.
    """
    check_user(user)

    try:

        try:
            title, md = firecrawlClient.run_scrape(str(url.url))
        except Exception as e:
            logger.error(str(e))
            raise HTTPException(
                status_code=400, detail="Could not retrieve the webpage"
            )

        sourceId = str(uuid4())
        sourceToInsert = {
            "sourceId": sourceId,
            "webId": web_id,
            "userId": user["id"],
            "name": title,
            "url": str(url.url),
            "type": "website",
            "size": len(md) * 200,
            "content": md,
            "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        }

        background_tasks.add_task(
            sourceService.embed_and_upsert_website, sourceId, md, web_id, url.url
        )

        neo4jClient.create_node("source", sourceToInsert)
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$push": {"sourceIds": sourceId}, "$set": {"updated": datetime.now(UTC)}},
        )
        return {"result": sourceId}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all/{web_id}")
def get_all_sources(web_id: str):
    """
    Retrieve all sources associated with a given web ID.

    Args:
        web_id (str): The ID of the web (web) to retrieve sources from.

    Returns:
        dict: A JSON response containing a list of sources associated with the given web ID.
    """
    try:
        sources = neo4jClient.get_all_sources_for_web("source", web_id)
        return {"result": sources}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presigned/url/{file_path:path}")
async def get_presigned_url(file_path: str):
    try:
        decoded_file_path = unquote(file_path)
        url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": s3_bucket.bucket_name,
                "Key": decoded_file_path,
                "ResponseContentDisposition": "inline",
                "ResponseContentType": "application/pdf",
            },
            ExpiresIn=3600,
        )
        return {"presigned_url": url}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/note/{web_id}/")
def upload_note(
    web_id: str,
    note: CreateNote,
    background_tasks: BackgroundTasks,
    user=Depends(manager),
):
    """
    Upload a note to a given web.

    Args:
        web_id (str): The ID of the web to upload the note to.
        note (CreateNote): The content of the note.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the ID of the uploaded note.
    """
    check_user(user)
    sourceId = str(uuid4())
    sourceToInsert = {
        "sourceId": sourceId,
        "webId": web_id,
        "userId": user["id"],
        "name": note.title,
        "content": note.content,
        "url": None,
        "type": "note",
        "size": None,
        "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    }

    background_tasks.add_task(
        sourceService.embed_and_upsert_note,
        sourceId,
        note.content,
        web_id,
        title=note.title,
    )

    try:
        neo4jClient.create_node("source", sourceToInsert)
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$push": {"sourceIds": sourceId}, "$set": {"updated": datetime.now(UTC)}},
        )
        return {"result": sourceId}
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/youtube/{web_id}/{video_id}")
def add_youtube(
    web_id: str, video_id: str, background_tasks: BackgroundTasks, user=Depends(manager)
):
    check_user(user)

    try:
        info = get_video_info(video_id)
        title, description = info["title"], info["description"]
        try:
            transcripts = get_video_transcript(video_id)

        except Exception as e:
            transcripts = []

        logger.info(f"Transcripts: {transcripts}")

        url = f"https://www.youtube.com/watch?v={video_id}"

        sourceId = str(uuid4())
        sourceToInsert = {
            "sourceId": sourceId,
            "webId": web_id,
            "userId": user["id"],
            "name": title,
            "content": description,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "type": "youtube",
            "size": 300000,
            "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        }

        background_tasks.add_task(
            sourceService.embed_and_upsert_youtube, sourceId, transcripts, web_id, url
        )

        neo4jClient.create_node("source", sourceToInsert)
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$push": {"sourceIds": sourceId}, "$set": {"updated": datetime.now(UTC)}},
        )
        return {"result": sourceId}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/note/{web_id}/{source_id}")
def update_note(
    web_id: str, source_id: str, updateNotePayload: UpdateNote, user=Depends(manager)
):
    """
    Update a note.

    Args:
        web_id (str): The ID of the web the note belongs to.
        source_id (str): The ID of the note to update.
        note (UpdateNote): The new content for the note.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    check_user(user)

    try:

        update_data = {
            key: value
            for key, value in updateNotePayload.model_dump(exclude_none=True).items()
        }
        update_data["updated"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")
        result = neo4jClient.update_source(source_id=source_id, properties=update_data)
        if result:
            return {"result": "Note updated"}
        else:
            return {"error": "Note not found or user not authorized"}, 404

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/source/{source_id}")
def delete_source(source_id: str, user=Depends(manager)):
    """
    Delete a source.

    Args:
        source_id (str): The ID of the source to delete.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.

    Raises:
        HTTPException: If the source is not found or user is not authorized.
    """
    check_user(user)

    try:
        result = neo4jClient.delete_source(source_id)
        if not result:
            return {"result": "Source not found"}

        # remove from s3 if it's a document type (commenting out for now for iterations)
        # if source["type"] == "document":
        #    s3.delete_object(Bucket=s3_bucket.bucket_name, Key=source["url"])
        # clean up web
        affected_web = Webs.find_one_and_update(
            {"sourceIds": source_id},
            {"$pull": {"sourceIds": source_id}, "$set": {"updated": datetime.now(UTC)}},
            return_document=True,
        )

        if not affected_web:
            {"result": "Web not found"}

        try:
            pineconeClient.index.delete(
                ids=[source_id], namespace=affected_web["webId"]
            )
        except:
            logger.info("Pinecone namespace not found...Skipping embeddings deletion")

        return {"result": "Source deleted"}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{source_id}")
def get_source(source_id: str, user=Depends(manager.optional)):
    """
    Retrieve a source by its ID.

    Args:
        source_id (str): The ID of the source to retrieve.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the source data if found.

    Raises:
        HTTPException: If the source is not found, raises a 404 error.
    """
    if user:
        check_user(user)
    try:
        source = neo4jClient.get_source_by_id("source", source_id)
        if not source:
            raise HTTPException(status_code=404, detail="Item not found")

        # if the source is a document, get the url from s3
        file_url = ""
        if source.get("type") == "document":
            decoded_file_path = source["url"]
            url = s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": s3_bucket.bucket_name,
                    "Key": decoded_file_path,
                    "ResponseContentDisposition": "inline",
                    "ResponseContentType": "application/pdf",
                },
                ExpiresIn=3600,
            )
            file_url = url

        return {"result": source, "file_url": file_url}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/edit/source/{sourceId}")
def edit_source(sourceId: str, info: UpdateSource, user=Depends(manager)):
    check_user(user)
    try:
        update_data = info.model_dump(exclude_none=True)
        update_data["updated"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")

        neo4jClient.update_source(source_id=sourceId, properties=update_data)

        return {"result", "Source updated"}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/image/{source_id}")  # for markdown image storage
async def upload_file_to_source(
    source_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user=Depends(manager),
):
    check_user(user)
    uploaded_image_urls = []

    try:
        for file in files:
            # sanitize filename
            object_name = f"files/{user['id']}/{source_id}/images/{uuid4()}_{secure_filename(file.filename)}"

            temp_dir = "/tmp/note_uploads"
            os.makedirs(temp_dir, exist_ok=True)

            temp_path = os.path.join(temp_dir, f"{uuid4()}_{file.filename}")

            try:
                contents = await file.read()
                with open(temp_path, "wb") as buffer:
                    buffer.write(contents)

                s3_bucket.upload_file(
                    temp_path,
                    object_name,
                )

                url = f"https://{settings.cloudfront_domain}/{object_name}"
                if not url:
                    raise HTTPException(status_code=500, detail="Error generating URL")

                uploaded_image_urls.append(url)
                neo4jClient.update_source(
                    source_id=source_id,
                    properties={
                        "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z")
                    },
                )

            except Exception as e:
                logger.error(f"Error uploading file {file.filename}: {str(e)}")
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
