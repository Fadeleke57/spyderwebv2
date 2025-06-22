from typing import List, Dict
from fastapi import HTTPException, BackgroundTasks
from src.models.index import User
from src.constants.source import DOCUMENT_TYPES, AUDIO_TYPES, TEXT_TYPES
import uuid
import os
import tempfile
import traceback
from src.lib.logger.index import logger
from datetime import datetime
from pytz import UTC
from src.models.index import Source
from src.db.neo4j import client as neo4j_client
from src.utils.storage import track_text_storage, track_file_storage
from src.core.config import settings
from src.models.index import Webs
from src.service.source import service as source_service
from src.service.extraction import service as extraction_service
from botocore.exceptions import ClientError
from src.utils.exceptions import StorageException


class FileService:
    def __init__(self, s3_client, bucket_name: str):
        self.s3_client = s3_client
        self.bucket_name = bucket_name
        logger.info("FILE SERVICE INITIALIZED!")

    def generate_presigned_urls(self, user: User, web_id: str, files: List[Dict]):
        urls = []

        for file_info in files:
            file_extension = file_info["fileName"].split(".")[-1].lower()
            if file_extension not in DOCUMENT_TYPES.union(AUDIO_TYPES).union(
                TEXT_TYPES
            ):
                continue

            file_route = (
                "document"
                if file_extension in DOCUMENT_TYPES
                else ("audio" if file_extension in AUDIO_TYPES else "text")
            )
            file_key = f"files/{user.id}/{web_id}/{file_route}/{uuid.uuid4()}_{file_info['fileName'].replace(' ', '_')}"

            presigned_post_response = self.s3_client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=file_key,
                ExpiresIn=1800,
            )

            urls.append(
                {
                    "uploadUrl": presigned_post_response["url"],
                    "fileKey": file_key,
                    "fields": presigned_post_response["fields"],
                    "fileName": file_info["fileName"],
                }
            )

        return {"urls": urls}

    def process_uploaded_files(
        self,
        user: User,
        web_id: str,
        files: List[Dict],
        preserve_links: bool,
        background_tasks: BackgroundTasks,
    ):
        try:
            if not files:
                raise HTTPException(status_code=400, detail="No files to process.")

            sources: List[Source] = []

            for file in files:
                try:
                    self.s3_client.head_object(
                        Bucket=self.bucket_name, Key=file["fileKey"]
                    )
                except ClientError:
                    continue

                file_extension: str = file["fileType"].lower()

                if file_extension in DOCUMENT_TYPES:
                    self._check_file_quota(user.id, file["fileSize"])
                    temp_path = self._download_temp(file["fileKey"], file["fileName"])
                    source = self._make_doc_source(user, web_id, file)
                    logger.info(f"Processing document: {source}")
                    background_tasks.add_task(
                        source_service.process_source,
                        source=source,
                        content_to_embed=None,
                        file_path=temp_path,
                    )

                elif file_extension in TEXT_TYPES:
                    logger.info("Text file found.")
                    text_content = self._read_s3_file_text(file["fileKey"])
                    self._check_text_quota(user.id, text_content)
                    source = self._make_text_source(user, web_id, file, text_content)
                    # delete file from s3 because it's stored as a note now
                    self.s3_client.delete_object(
                        Bucket=self.bucket_name, Key=file["fileKey"]
                    )
                    background_tasks.add_task(
                        source_service.process_source,
                        source=source,
                        content_to_embed=text_content,
                    )

                elif file_extension in AUDIO_TYPES:
                    self._check_file_quota(user.id, file["fileSize"])
                    temp_path = self._download_temp(file["fileKey"], file["fileName"])

                    logger.info(f"Transcribing audio at: {temp_path}")

                    try:
                        transcript = extraction_service.extract_audio_content(temp_path)
                    except Exception as e:
                        logger.error(f"Failed to transcribe audio: {str(e)}")
                        raise HTTPException(status_code=500, detail=str(e))

                    logger.info(f"Transcript: {transcript}")

                    source = self._make_audio_source(
                        user, web_id, file, transcript, file["fileKey"]
                    )
                    background_tasks.add_task(
                        source_service.process_source,
                        source=source,
                        content_to_embed=transcript,
                    )

                neo4j_client.create_node("source", source.model_dump())
                Webs.update_one(
                    {"webId": web_id, "userId": user.id},
                    {
                        "$push": {"sourceIds": source.sourceId},
                        "$set": {"updated": datetime.now(UTC)},
                    },
                )
                sources.append(source)

            if preserve_links and sources:
                background_tasks.add_task(
                    source_service.parse_obsidian_links, web_id, sources
                )

            return {
                "result": sources[0].sourceId if sources else None,
                "process": "",
            }
        except Exception as e:
            traceback.print_exc()
            logger.error(f"File processing failed: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"File processing failed: {str(e)}"
            )

    def _download_temp(self, file_key: str, file_name: str) -> str:
        path = os.path.join(tempfile.gettempdir(), file_name)
        self.s3_client.download_file(self.bucket_name, file_key, path)
        return path

    def get_presigned_url(self, file_key: str, media_type: str) -> str:
        return self.s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket_name,
                "Key": file_key,
                "ResponseContentDisposition": "inline",
                "ResponseContentType": media_type,
            },
            ExpiresIn=3600,
        )

    def _read_s3_file_text(self, file_key: str) -> str:
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=file_key)
            return response["Body"].read().decode("utf-8")
        except ClientError as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to read file: {str(e)}"
            )

    def _check_file_quota(self, user_id: str, size: int):
        if not track_file_storage(fileSizeBytes=size, userId=user_id, operation="$inc"):
            raise StorageException()

    def _check_text_quota(self, user_id: str, text: str):
        if not track_text_storage(extractedText=text, userId=user_id, operation="$inc"):
            raise StorageException()

    def _make_doc_source(
        self, user: User, web_id: str, file: Dict, max_retries: int = 3
    ) -> Source:
        try:
            return source_service.create_source(
                webId=web_id,
                userId=user.id,
                name=file["fileName"],
                content=None,
                url=file["fileKey"],
                type="document",
                size=file["fileSize"],
                created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            )
        except Exception as e:
            logger.error(f"Failed to create document source: {str(e)}...Trying again.")
            if max_retries > 0:
                return self._make_doc_source(user, web_id, file, max_retries - 1)
            else:
                raise HTTPException(status_code=500, detail=str(e))

    def _make_text_source(
        self, user: User, web_id: str, file: Dict, content: str, max_retries: int = 3
    ) -> Source:
        try:
            filename = (" ".join(file["fileName"].split(".")[:-1])).replace("%22", " ")
            return source_service.create_source(
                webId=web_id,
                userId=user.id,
                name=filename,
                content=content,
                url=None,
                type="note",
                size=file["fileSize"],
                created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            )
        except Exception as e:
            logger.error(f"Failed to create text source: {str(e)}...Trying again.")
            if max_retries > 0:
                return self._make_text_source(
                    user, web_id, file, content, max_retries - 1
                )
            else:
                raise HTTPException(status_code=500, detail=str(e))

    def _make_audio_source(
        self,
        user: User,
        web_id: str,
        file: Dict,
        transcript: str,
        file_url: str,
        max_retries: int = 3,
    ) -> Source:
        try:
            return source_service.create_source(
                webId=web_id,
                userId=user.id,
                name=f"{transcript[:50]}...",
                content=transcript,
                url=file_url,
                type="voice_note",
                size=file["fileSize"],
                created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            )
        except Exception as e:
            logger.error(f"Failed to create audio source: {str(e)}...Trying again.")
            if max_retries > 0:
                return self._make_audio_source(
                    user, web_id, file, transcript, file_url, max_retries - 1
                )
            else:
                raise HTTPException(status_code=500, detail=str(e))
