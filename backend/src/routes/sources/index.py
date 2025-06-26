import os
import boto3
import json
from typing import List
from pytz import UTC
from datetime import datetime
from uuid import uuid4
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from pydantic import BaseModel, HttpUrl
from urllib.parse import unquote
from src.utils.exceptions import StorageException
from src.utils.storage import track_text_storage, track_file_storage
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks
from src.routes.auth.utils import manager
from src.lib.logger.index import logger
from src.lib.s3.index import S3Bucket
from src.models.index import (
    Webs,
    CreateNote,
    UpdateNote,
    UpdateSource,
    Users,
    User,
)
from src.service.source import service as source_service
from src.db.neo4j import client as neo4j_client
from src.core.config import settings
from src.service.index import (
    chunking_service,
    extraction_service,
    embedding_service,
    FileService,
)
from src.lib.youtube.index import client as youtube_client
from src.lib.firecrawl.index import client as firecrawl_client
from src.constants.source import DOCUMENT_TYPES, AUDIO_TYPES, MEDIA_TYPE_MAP

router = APIRouter()


class FileInfo(BaseModel):
    fileName: str
    fileSize: int
    fileType: str


class PresignedUrlRequest(BaseModel):
    files: List[FileInfo]


class ProcessFileRequest(BaseModel):
    fileName: str
    fileKey: str
    fileSize: int
    fileType: str


class ProcessUploadedFilesRequest(BaseModel):
    files: List[ProcessFileRequest]
    preserve_obsidian_links: bool = False


s3_base_interface = boto3.client("s3")
s3_bucket_interface = S3Bucket(settings.s3_bucket_name)

file_service = FileService(s3_base_interface, settings.s3_bucket_name)


@router.post("/presigned-urls/{web_id}")
async def get_presigned_urls(
    web_id: str, request: PresignedUrlRequest, user: User = Depends(manager.required)
):
    try:
        return file_service.generate_presigned_urls(
            user, web_id, request.model_dump()["files"]
        )
    except ClientError as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate presigned URLs: {str(e)}"
        )


@router.post("/process-uploaded-files/{web_id}")
async def process_uploaded_files(
    web_id: str,
    request: ProcessUploadedFilesRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required),
):
    try:
        return file_service.process_uploaded_files(
            user,
            web_id,
            request.model_dump()["files"],
            request.preserve_obsidian_links,
            background_tasks,
        )
    except Exception as e:
        logger.error(f"File processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class UrlRequest(BaseModel):
    url: HttpUrl


@router.post("/website/{web_id}")
def upload_website(
    web_id: str,
    url: UrlRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required),
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
        markdown, metadata = extraction_service.extract_website_content(
            url=str(url.url)
        )

        text_storage_result = track_text_storage(markdown, user.id, operation="$inc")
        if not text_storage_result:
            raise HTTPException(status_code=400, detail="Text storage limit reached")

        source_to_insert = source_service.create_source(
            webId=web_id,
            userId=user.id,
            name=metadata.get("title", ""),
            url=str(url.url),
            type="website",
            size=len(markdown.encode("utf-8")),
            content=markdown,
            created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            ogImage=metadata.get("ogImage", ""),
            ogDescription=metadata.get("ogDescription", ""),
            ogTitle=metadata.get("ogTitle", ""),
            favicon=metadata.get("favicon", ""),
        )
        logger.info("source created, processing...")

        background_tasks.add_task(
            source_service.process_source,
            source=source_to_insert,
            content_to_embed=markdown,
        )

        neo4j_client.create_node("source", source_to_insert.model_dump())

        Webs.update_one(
            {"webId": web_id, "userId": user.id},
            {
                "$addToSet": {"sourceIds": source_to_insert.sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
        )
        return {"result": source_to_insert.sourceId}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all/{web_id}")
def get_all_sources(web_id: str, _: User = Depends(manager.optional)):
    """
    Retrieve all sources associated with a given web ID.

    Args:
        web_id (str): The ID of the web (web) to retrieve sources from.

    Returns:
        dict: A JSON response containing a list of sources associated with the given web ID.
    """
    try:
        sources = neo4j_client.get_all_sources_for_web("source", web_id)
        return {"result": sources}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presigned/url/{file_path:path}")
async def get_presigned_url(file_path: str):
    try:
        decoded_file_path = unquote(file_path)
        url = s3_base_interface.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.s3_bucket_name,
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
    user: User = Depends(manager.required),
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

    deduct_text_storage_result = track_text_storage(
        note.content, user.id, operation="$inc"
    )
    if not deduct_text_storage_result:
        raise StorageException()

    source_to_insert = source_service.create_source(
        webId=web_id,
        userId=user.id,
        name=note.title,
        content=note.content,
        url=None,
        type="note",
        size=len((note.content or "").encode("utf-8")),
        created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    )

    background_tasks.add_task(
        source_service.process_source,
        source=source_to_insert,
        content_to_embed=note.content,
    )

    try:
        neo4j_client.create_node("source", source_to_insert.model_dump())
        Webs.update_one(
            {"webId": web_id, "userId": user.id},
            {
                "$addToSet": {"sourceIds": source_to_insert.sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
        )
        return {"result": source_to_insert.sourceId}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/youtube/{web_id}/{video_id}")
def upload_youtube_video(
    web_id: str,
    video_id: str,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required),
):
    try:
        info = youtube_client.get_video_info(video_id)
        title, description = info["title"], info["description"]
        transcripts = extraction_service.extract_youtube_transcript(video_id)

        logger.info(f"Transcripts: {transcripts}")

        url = f"https://www.youtube.com/watch?v={video_id}"
        json_transcript = json.dumps(transcripts, indent=2)

        text_storage_result = track_text_storage(
            json_transcript, user.id, operation="$inc"
        )
        if not text_storage_result:
            raise HTTPException(status_code=405, detail="Text storage limit reached")

        source_to_insert = source_service.create_source(
            webId=web_id,
            userId=user.id,
            name=title,
            description=description,
            content=json_transcript,
            url=url,
            type="youtube",
            size=len(json_transcript.encode("utf-8")),
            created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        )

        if transcripts:
            background_tasks.add_task(
                source_service.process_source,
                source=source_to_insert,
                content_to_embed=transcripts,
            )

        neo4j_client.create_node("source", source_to_insert.model_dump())

        Webs.update_one(
            {"webId": web_id, "userId": user.id},
            {
                "$addToSet": {"sourceIds": source_to_insert.sourceId},
                "$set": {"updated": datetime.now(UTC)},
            },
        )
        return {
            "result": source_to_insert.sourceId,
            "transcripts_found": True if transcripts else False,
        }

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/note/{web_id}/{source_id}")
def update_note(
    web_id: str,
    source_id: str,
    updateNotePayload: UpdateNote,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required),
):

    try:
        update_data = updateNotePayload.model_dump(exclude_none=True)
        update_data["updated"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")

        previous_source = neo4j_client.get_source_by_id("source", source_id=source_id)
        if not previous_source:
            raise HTTPException(status_code=404, detail="Note not found")

        prev_content: str = previous_source.get("content") or ""
        new_content: str = update_data.get("content") or ""

        if new_content:
            new_size = len(new_content.encode("utf-8"))
            prev_size = len(prev_content.encode("utf-8"))
            update_data["size"] = new_size
            byte_diff = new_size - prev_size

            if byte_diff != 0:
                Users.update_one({"id": user.id}, {"$inc": {"storage_used": byte_diff}})

        updated_source = neo4j_client.update_source(
            source_id=source_id, properties=update_data
        )

        new_chunks = chunking_service.chunk_cleaned_md(
            updated_source.get("content", "")
        )
        background_tasks.add_task(
            embedding_service.refresh_note_embeddings,
            source=updated_source,
            new_chunks=new_chunks,
        )

        return {"result": True}

    except Exception as e:
        logger.error(f"{str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/source/{source_id}")
def delete_source(
    source_id: str,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager.required),
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
        source_to_delete = neo4j_client.get_source_by_id("source", source_id)
        if not source_to_delete:
            return {"result": "Source not found"}

        try:
            if source_to_delete.get("type") in DOCUMENT_TYPES.union(AUDIO_TYPES):
                file_key: str = source_to_delete.get("url", "")
                if file_key:
                    object_key = file_key.split(f"{settings.cloudfront_domain}/")[-1]
                    s3_base_interface.delete_object(
                        Bucket=settings.s3_bucket_name, Key=object_key
                    )
                    logger.info(f"Deleted S3 object: {object_key}")

                file_size_bytes: int = source_to_delete.get("size", 0)
                if file_size_bytes:
                    track_file_storage(
                        fileSizeBytes=file_size_bytes,
                        userId=user.id,
                        operation="$dec",
                    )
        except Exception as e:
            logger.warning(
                f"Error deleting S3 object or rolling back file storage: {e}"
            )

        try:
            content: str = source_to_delete.get("content", "")
            if content:
                track_text_storage(
                    extractedText=content, userId=user.id, operation="$dec"
                )
        except Exception as e:
            logger.warning(f"Error rolling back text storage: {e}")

        result = neo4j_client.delete_source(source_id)
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
            embedding_service.delete_source_embeddings,
            source=source_to_delete,
        )

        return {"result": "Source deleted"}

    except Exception as e:
        logger.error(f"Error deleting source: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{source_id}")
def get_source(source_id: str, _=Depends(manager.optional)):
    """
    Retrieve a source by its ID and generate a presigned file URL if applicable.
    """
    try:
        source = neo4j_client.get_source_by_id("source", source_id)
        if not source:
            raise HTTPException(status_code=404, detail="Item not found")

        file_url = ""
        file_key = source.get("url")
        source_type: str = source.get("type", "").lower()

        # determine file media type
        if file_key:
            file_key = file_key.split(f"{settings.cloudfront_domain}/")[-1]
            for extension, media_type in MEDIA_TYPE_MAP.items():
                if source_type.endswith(extension):
                    file_url = file_service.get_presigned_url(file_key, media_type)
                    break

        return {"result": source, "file_url": file_url}

    except Exception as e:
        logger.error(f"Error retrieving source {source_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


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

        updated_source = neo4j_client.update_source(
            source_id=sourceId, properties=update_data
        )

        if not updated_source:
            raise HTTPException(status_code=404, detail="Source not found")

        background_tasks.add_task(
            embedding_service.refresh_metadata,
            sourceId=sourceId,
            metadata=update_data,
        )

        return {"result": True}

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/image/{source_id}")  # for markdown image storage
async def upload_image_to_source(
    source_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user: User = Depends(manager.required),
):
    uploaded_image_urls = []

    try:
        for file in files:
            object_name = f"files/{user.id}/{source_id}/images/{uuid4()}_{secure_filename(file.filename)}"

            temp_dir = "/tmp/note_uploads"
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, f"{uuid4()}_{file.filename}")

            try:
                contents = await file.read()
                file_size_bytes = len(contents)

                # track storage usage for each image
                file_storage_success = track_file_storage(
                    fileSizeBytes=file_size_bytes, userId=user.id, operation="$inc"
                )
                if not file_storage_success:
                    raise HTTPException(
                        status_code=400, detail="Storage limit exceeded"
                    )

                with open(temp_path, "wb") as buffer:
                    buffer.write(contents)

                s3_bucket_interface.upload_file(temp_path, object_name)
                url = f"https://{settings.cloudfront_domain}/{object_name}"
                uploaded_image_urls.append(url)

                neo4j_client.update_source(
                    source_id=source_id,
                    properties={
                        "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z")
                    },
                )

                # TODO: Embed image content

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


@router.get("/link/preview")
def get_link_preview(
    sourceId: str,
    url: str,
):
    try:
        source = neo4j_client.get_source_by_id("source", sourceId)

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
            metadata = firecrawl_client.get_markdown(url=url, just_metadata=True)

            ogImage = metadata.get("ogImage", "")
            ogDescription = metadata.get("ogDescription", "")
            ogTitle = metadata.get("ogTitle", "")
            favicon = metadata.get("favicon", "")

        link_preview = {
            "ogImage": ogImage,
            "ogDescription": ogDescription,
            "ogTitle": ogTitle,
            "favicon": favicon,
        }

        return {"result": link_preview}

    except Exception as e:
        logger.error(str(e))

        error_link_preview = {
            "ogImage": "",
            "ogDescription": "",
            "ogTitle": "",
            "favicon": "",
        }

        return {"result": error_link_preview}
