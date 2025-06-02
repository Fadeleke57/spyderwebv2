import os
import boto3
import json
import tempfile
from typing import List
from pytz import UTC
from datetime import datetime
from uuid import uuid4
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from pydantic import BaseModel, HttpUrl
from urllib.parse import unquote
from src.utils.storage import handleTextStorage, handleFileStorage
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks
from src.routes.auth.utils import manager
from src.lib.logger.index import logger
from src.utils.chat.tools import get_graph_context
from src.lib.s3.index import S3Bucket
from src.models.index import (
    Webs,
    create_process,
    update_process,
    CreateNote,
    UpdateNote,
    Source,
    UpdateSource,
    Users,
)
from src.service.source import service as sourceService
from src.db.neo4j import client as neo4jClient
from src.core.config import settings
from src.lib.firecrawl.index import client as firecrawlClient
from src.lib.openai.index import client as openaiClient
from src.lib.youtube.index import client as youtubeClient

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

            s3_bucket.upload_file(temp_path, object_name)  # upload to S3

            fileStorageResult = handleFileStorage(
                fileSizeBytes=os.path.getsize(temp_path),
                userId=user_id,
                operation="$inc",
            )
            if not fileStorageResult:
                raise HTTPException(status_code=400, detail="Storage limit exceeded")

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
                file_path=temp_path,
                source=sourceToInsert,
            )

        elif file_type in {"txt", "md"}:
            with open(temp_path, "r", encoding="utf-8") as f:
                text_content = f.read()

                filename = (" ".join(file.filename.split(".")[:-1])).replace("%22", " ")

                textStorageResult = handleTextStorage(
                    extractedText=text_content,
                    userId=user_id,
                    operation="$inc",
                )
                if not textStorageResult:
                    raise HTTPException(
                        status_code=400, detail="Storage limit exceeded"
                    )

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
                source=sourceToInsert,
                text=text_content,
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
        update_process(
            job_id=job_id,
            status="failed",
            description="Failed to proccess file..",
            percentage=0,
            error=str(e),
        )
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/files/{web_id}")
async def upload_files(
    web_id: str,
    background_tasks: BackgroundTasks,
    preserve_obsidian_links: bool,
    files: List[UploadFile] = File(...),
    user=Depends(manager.required),
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
    job_id = create_process(
        web_id=web_id, type="upload", description=f"Uploading {len(files)} files..."
    )

    if not files:
        update_process(
            job_id=job_id,
            status="failed",
            description="No files uploaded.",
            percentage=0,
            error="No files uploaded.",
        )
        raise HTTPException(status_code=400, detail="No files uploaded.")

    sources = []
    for i, file in enumerate(files):
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
            description=f"Uploading {len(files) - len(sources)} files...",
            status="processing",
            percentage=(round((i + 1) / len(files) * 100, 2)),
        )

    if preserve_obsidian_links:
        logger.info("Parsing Obsidian links...")
        background_tasks.add_task(sourceService.parse_obsidian_links, web_id, sources)

    update_process(
        job_id=job_id,
        description="Finished uploading files!",
        status="completed",
        percentage=100,
    )
    return {"result": sources[0]["sourceId"] if sources else None, "process": job_id}


class UrlRequest(BaseModel):
    url: HttpUrl


@router.post("/website/{web_id}")
def add_website(
    web_id: str,
    url: UrlRequest,
    background_tasks: BackgroundTasks,
    user=Depends(manager.required),
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

    try:

        md, meta = firecrawlClient.getMarkdown(url=str(url.url), withMetadata=True)
        title = meta.get("title", None)

        sourceId = str(uuid4())

        textStorageResult = handleTextStorage(md, user["id"], operation="$inc")
        if not textStorageResult:
            raise HTTPException(status_code=400, detail="Text storage limit reached")

        sourceToInsert = {
            "sourceId": sourceId,
            "webId": web_id,
            "userId": user["id"],
            "name": title,
            "url": str(url.url),
            "type": "website",
            "size": len(md.encode("utf-8")),
            "content": md,
            "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "ogImage": meta.get("ogImage", ""),
            "ogDescription": meta.get("ogDescription", ""),
            "ogTitle": meta.get("ogTitle", ""),
            "favicon": meta.get("favicon", ""),
        }

        background_tasks.add_task(
            sourceService.embed_and_upsert_website,
            source=sourceToInsert,
            md=md,
        )

        neo4jClient.create_node("source", sourceToInsert)

        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {
                "$addToSet": {"sourceIds": sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
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
    user=Depends(manager.required),
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
    sourceId = str(uuid4())

    deductTextStorageResult = handleTextStorage(
        note.content, user["id"], operation="$inc"
    )
    if not deductTextStorageResult:
        raise HTTPException(status_code=400, detail="Text storage limit reached")

    sourceToInsert = {
        "sourceId": sourceId,
        "webId": web_id,
        "userId": user["id"],
        "name": note.title,
        "content": note.content,
        "url": None,
        "type": "note",
        "size": len((note.content or "").encode("utf-8")),
        "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    }

    background_tasks.add_task(
        sourceService.embed_and_upsert_note,
        source=sourceToInsert,
        text=note.content,
    )

    try:

        neo4jClient.create_node("source", sourceToInsert)
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {
                "$addToSet": {"sourceIds": sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
        )
        return {"result": sourceId}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/youtube/{web_id}/{video_id}")
def add_youtube(
    web_id: str,
    video_id: str,
    background_tasks: BackgroundTasks,
    user=Depends(manager.required),
):

    try:
        info = youtubeClient.get_video_info(video_id)
        title, description = info["title"], info["description"]

        transcripts = youtubeClient.get_video_transcript(video_id)

        logger.info(f"Transcripts: {transcripts}")

        url = f"https://www.youtube.com/watch?v={video_id}"

        sourceId = str(uuid4())

        jsonTranscript = json.dumps(transcripts, indent=2)
        textStorageResult = handleTextStorage(
            jsonTranscript, user["id"], operation="$inc"
        )
        if not textStorageResult:
            raise HTTPException(status_code=400, detail="Text storage limit reached")

        sourceToInsert = {
            "sourceId": sourceId,
            "webId": web_id,
            "userId": user["id"],
            "name": title,
            "content": jsonTranscript,
            "url": url,
            "type": "youtube",
            "size": len(jsonTranscript.encode("utf-8")),
            "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "description": description,
        }

        if transcripts:
            background_tasks.add_task(
                sourceService.embed_and_upsert_youtube,
                sourceToInsert,
                transcripts,
            )

        neo4jClient.create_node("source", sourceToInsert)

        sourceToInsert["content"] = description
        del sourceToInsert["description"]

        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {
                "$addToSet": {"sourceIds": sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
        )
        return {"result": sourceId, "transcripts_found": not not transcripts}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/note/{web_id}/{source_id}")
def update_note(
    web_id: str,
    source_id: str,
    updateNotePayload: UpdateNote,
    background_tasks: BackgroundTasks,
    user=Depends(manager.required),
):

    try:
        update_data = updateNotePayload.model_dump(exclude_none=True)
        update_data["updated"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")

        previousSource = neo4jClient.get_source_by_id("source", source_id=source_id)
        if not previousSource:
            raise HTTPException(status_code=404, detail="Note not found")

        prev_content = previousSource.get("content") or ""
        new_content = update_data.get("content") or ""

        if new_content:
            new_size = len(new_content.encode("utf-8"))
            prev_size = len(prev_content.encode("utf-8"))
            update_data["size"] = new_size
            byte_diff = new_size - prev_size

            if byte_diff != 0:
                Users.update_one(
                    {"id": user["id"]}, {"$inc": {"storage_used": byte_diff}}
                )

        updatedSource = neo4jClient.update_source(
            source_id=source_id, properties=update_data
        )

        background_tasks.add_task(
            sourceService.refresh_note_embeddings,
            source=updatedSource,
            content=updatedSource.get("content", ""),
        )

        return {"result": True}

    except Exception as e:
        logger.error(f"{str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/source/{source_id}")
def delete_source(
    source_id: str, background_tasks: BackgroundTasks, user=Depends(manager.required)
):
    """
    Delete a source and deduct associated storage usage.

    Args:
        source_id (str): The ID of the source to delete.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.

    Raises:
        HTTPException: If the source is not found or user is not authorized.
    """

    try:
        sourceToDelete = neo4jClient.get_source_by_id("source", source_id)
        if not sourceToDelete:
            return {"result": "Source not found"}

        try:
            if sourceToDelete.get("type") in ("document", "voice_note"):
                file_url = sourceToDelete.get("url", "")
                if file_url:
                    object_key = file_url.split(f"{settings.cloudfront_domain}/")[-1]
                    s3.delete_object(Bucket=s3_bucket.bucket_name, Key=object_key)
                    logger.info(f"Deleted S3 object: {object_key}")

                file_size_bytes = sourceToDelete.get("size", 0)
                if file_size_bytes:
                    handleFileStorage(
                        fileSizeBytes=file_size_bytes,
                        userId=user["id"],
                        operation="$dec",
                    )
        except Exception as e:
            logger.warning(
                f"Error deleting S3 object or rolling back file storage: {e}"
            )

        try:
            content = sourceToDelete.get("content", "")
            if content:
                handleTextStorage(
                    extractedText=content, userId=user["id"], operation="$dec"
                )
        except Exception as e:
            logger.warning(f"Error rolling back text storage: {e}")

        result = neo4jClient.delete_source(source_id)
        if not result:
            return {"result": "Source not found"}

        affected_web = Webs.find_one_and_update(
            {"sourceIds": source_id},
            {"$pull": {"sourceIds": source_id}, "$set": {"updated": datetime.now(UTC)}},
            return_document=True,
        )

        if not affected_web:
            logger.info("Web not found")
            return {"result": "Web not found"}

        background_tasks.add_task(
            sourceService.delete_source_embeddings,
            source=sourceToDelete,
        )

        return {"result": "Source deleted"}

    except Exception as e:
        logger.error(f"Error deleting source: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{source_id}")
def get_source(source_id: str, _=Depends(manager.optional)):
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
def edit_source(
    sourceId: str,
    updatePayload: UpdateSource,
    background_tasks: BackgroundTasks,
    _=Depends(manager.required),
):
    try:
        update_data = updatePayload.model_dump(exclude_none=True)
        update_data["updated"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")

        updated_source = neo4jClient.update_source(
            source_id=sourceId, properties=update_data
        )

        if not updated_source:
            raise HTTPException(status_code=404, detail="Source not found")

        webId = updated_source["webId"]

        background_tasks.add_task(
            sourceService.refresh_metadata,
            webId=webId,
            sourceId=sourceId,
            metadata=update_data,
        )

        return {"result": True}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/all")
def search_sources_semantic(
    webId: str,
    query: str,
    sources: list[str] = [],
    limit: int = 20,
    boundary: bool = True,
    user=Depends(manager.required),
):
    """
    Search all sources in a web using a semantic search.

    Args:
        webId (str): The ID of the web to search in.
        query (str): The query string to search for.
        sources (list[str], optional): A list of source IDs to filter by. Defaults to [].
        limit (int, optional): The number of results to return. Defaults to 20.
        boundary (bool, optional): Whether to apply the web ID as a filter or not. Defaults to True.

    Returns:
        dict: A JSON response containing a list of dictionaries, each containing the metadata of a result, as well as its ID.
    """
    
    try:
        sources = get_graph_context(
            webId=webId,
            query=query,
            sources=sources,
            limit=limit,
            boundary=boundary,
            userId=user["id"],
        )
        return {"result": sources}
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/image/{source_id}")  # for markdown image storage
async def upload_file_to_source(
    source_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user=Depends(manager.required),
):
    uploaded_image_urls = []

    try:
        for file in files:
            object_name = f"files/{user['id']}/{source_id}/images/{uuid4()}_{secure_filename(file.filename)}"

            temp_dir = "/tmp/note_uploads"
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, f"{uuid4()}_{file.filename}")

            try:
                contents = await file.read()
                file_size_bytes = len(contents)

                # track storage usage for each image
                file_storage_success = handleFileStorage(
                    fileSizeBytes=file_size_bytes, userId=user["id"], operation="$inc"
                )
                if not file_storage_success:
                    raise HTTPException(
                        status_code=400, detail="Storage limit exceeded"
                    )

                with open(temp_path, "wb") as buffer:
                    buffer.write(contents)

                s3_bucket.upload_file(temp_path, object_name)
                url = f"https://{settings.cloudfront_domain}/{object_name}"
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


@router.post("/upload/voice-note/{web_id}")
async def upload_voice_note(
    web_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user=Depends(manager.required),
):
    """
    Upload a voice note, transcribe it, and create a source.

    Args:
        web_id (str): The ID of the web to upload to
        file (UploadFile): The voice note audio file
        user (User): The authenticated user

    Returns:
        dict: JSON response with the source ID
    """

    try:
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"{uuid4()}_{file.filename}")

        content = await file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)

        try:
            object_name = f"files/{user['id']}/{web_id}/voice-notes/{uuid4()}_{secure_filename(file.filename)}"

            file_storage_success = handleFileStorage(
                fileSizeBytes=len(content), userId=user["id"], operation="$inc"
            )
            if not file_storage_success:
                raise HTTPException(
                    status_code=400, detail="File storage limit exceeded"
                )

            s3_bucket.upload_file(temp_path, object_name)
            file_url = f"https://{settings.cloudfront_domain}/{object_name}"

            transcript: str = openaiClient.get_audio_transcript(temp_path)
            if not transcript:
                raise HTTPException(
                    status_code=500, detail="Failed to transcribe audio"
                )

            text_storage_success = handleTextStorage(
                extractedText=transcript, userId=user["id"], operation="$inc"
            )
            if not text_storage_success:
                raise HTTPException(
                    status_code=400, detail="Text storage limit exceeded"
                )

            source_id = str(uuid4())
            source_to_insert = {
                "sourceId": source_id,
                "webId": web_id,
                "userId": user["id"],
                "name": f"{transcript[:50]}...",
                "content": transcript,
                "url": file_url,
                "type": "voice_note",
                "size": len(content),
                "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            }

            neo4jClient.create_node("source", source_to_insert)

            Webs.update_one(
                {"webId": web_id, "userId": user["id"]},
                {
                    "$push": {"sourceIds": source_id},
                    "$set": {"updated": datetime.now(UTC)},
                },
            )

            # process embeddings in background (embedding storage will be handled in that function)
            background_tasks.add_task(
                sourceService.embed_and_upsert_voice_note,
                source=source_to_insert,
                text=transcript,
            )

            return {"result": source_id}

        except Exception as e:
            logger.error(f"Error processing voice note: {str(e)}")
            raise HTTPException(status_code=500, detail="Error processing voice note")

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.error(f"Voice note upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/link/preview")
def get_link_preview(
    sourceId: str,
    url: str,
    background_tasks: BackgroundTasks,
    _=Depends(manager.optional),
):

    try:

        source = neo4jClient.get_source_by_id("source", sourceId)

        ogImage = source.get("ogImage", None)
        ogDescription = source.get("ogDescription", None)
        ogTitle = source.get("ogTitle", None)
        favicon = source.get("favicon", None)

        if (
            ogImage == None
            or ogDescription == None
            or ogTitle == None
            or favicon == None
        ):
            logger.info(f"Missing metadata for source {sourceId}...")
            logger.info(
                f"Got ogImage: {ogImage}, ogDescription: {ogDescription}, ogTitle: {ogTitle}, favicon: {favicon}"
            )
            metadata = firecrawlClient.getMarkdown(url=url, justMetadata=True)

            ogImage = metadata.get("ogImage", "")
            ogDescription = metadata.get("ogDescription", "")
            ogTitle = metadata.get("ogTitle", "")
            favicon = metadata.get("favicon", "")

            metadataToUpdate = {
                "ogImage": ogImage,
                "ogDescription": ogDescription,
                "ogTitle": ogTitle,
                "favicon": favicon,
                "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            }

            background_tasks.add_task(
                sourceService.addLinkMetaData, sourceId, metadataToUpdate
            )

        linkPreview = {
            "ogImage": ogImage,
            "ogDescription": ogDescription,
            "ogTitle": ogTitle,
            "favicon": favicon,
        }

        return {"result": linkPreview}

    except Exception as e:
        logger.error(str(e))

        errorLinkPreview = {
            "ogImage": "",
            "ogDescription": "",
            "ogTitle": "",
            "favicon": "",
        }

        background_tasks.add_task(
            sourceService.addLinkMetaData, sourceId, errorLinkPreview
        )

        return {"result": errorLinkPreview}
