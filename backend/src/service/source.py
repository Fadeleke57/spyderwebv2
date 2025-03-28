import os
import re
import pymupdf4llm
from typing import List
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException
from src.models.index import Source, Connection, create_process, update_process
from src.db.neo4j import client as neo4jClient
from src.lib.pinecone.index import client as pineconeClient
from src.lib.logger.index import logger


class SourceService:
    def __init__(self):
        pass

    def embed_and_upsert_website(self, sourceId, md, web_id, url):
        """ """
        try:
            chunks = pineconeClient.chunk_clean_text(md)
            results = pineconeClient.embed_and_upsert_to_pinecone(
                sourceId, chunks, web_id, type="website", url=url
            )
            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def embed_and_upsert_youtube(
        self, sourceId: str, transcripts, web_id: str, url: str
    ):
        """ """
        try:
            chunks = pineconeClient.chunk_youtube_transcript(transcripts)
            results = pineconeClient.embed_and_upsert_to_pinecone(
                sourceId, chunks, web_id, type="youtube", url=url
            )
            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def embed_and_upsert_pdf(
        self, sourceId: str, file_path: str, web_id: str, url: str
    ):
        """ """
        try:
            md = pymupdf4llm.to_markdown(file_path)
            os.remove(file_path)
            if not md:
                logger.info("No text found in PDF")
                return
            chunks = pineconeClient.chunk_clean_text(
                md, chunk_size=1000, chunk_overlap=100
            )
            results = pineconeClient.embed_and_upsert_to_pinecone(
                sourceId, chunks, web_id, type="document", url=url
            )
            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def embed_and_upsert_note(self, sourceId: str, text, web_id, title, type="note"):
        try:
            chunks = pineconeClient.chunk_clean_text(
                text=text, chunk_size=300, chunk_overlap=50
            )
            results = pineconeClient.embed_and_upsert_to_pinecone(
                sourceId, chunks, web_id, type=type, title=title
            )
            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def parse_obsidian_links(self, web_id: str, sources: List[Source]) -> bool:
        connection_proccess_id = create_process(
            web_id=web_id,
            type="connect",
            description="Parsing Obsidian links...",
        )

        try:

            for i, source in enumerate(sources):
                linkPattern = r"\[\[(.*?)(?:\|.*?)?(?:#.*?)?\]\]"
                embedPattern = r"!\[\[(.*?)(?:\|.*?)?(?:#.*?)?\]\]"

                for match in re.finditer(linkPattern, source.get("content", "")):
                    logger.info(f"Match: {match.group(1)}")
                    target_filename = match.group(1).split("|")[0].split("#")[0].strip()
                    target_source = next(
                        (
                            s
                            for s in sources
                            if s.get("name", "").strip() == target_filename
                        ),
                        None,
                    )
                    target_id = target_source["sourceId"] if target_source else None

                    if target_id:
                        logger.info(f"Found target source: {target_source}")
                        connection_id = str(uuid4())
                        connectionToInsert = {
                            "connectionId": connection_id,
                            "webId": web_id,
                            "data.description": "Mentioned in note",
                            "fromSourceId": source["sourceId"],
                            "toSourceId": target_id,
                            "created": datetime.now(),
                            "updated": datetime.now(),
                        }

                        try:
                            neo4jClient.create_connection_between_sources(
                                connectionToInsert["fromSourceId"],
                                connectionToInsert["toSourceId"],
                                connectionToInsert,
                            )
                            logger.info(f"Created connection: {connectionToInsert}")
                        except Exception as e:
                            logger.error(str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                for match in re.finditer(embedPattern, source.get("content", "")):
                    logger.info(f"Match: {match.group(1)}")
                    target_filename = match.group(1).split("|")[0].split("#")[0].strip()
                    target_source = next(
                        (
                            s
                            for s in sources
                            if s.get("name", "").strip() == target_filename
                        ),
                        None,
                    )
                    target_id = target_source.sourceId if target_source else None

                    if target_id:
                        logger.info(f"Found target source: {target_source}")
                        connection_id = str(uuid4())
                        connectionToInsert = {
                            "connectionId": connection_id,
                            "webId": web_id,
                            "data.description": "Mentioned in note",
                            "fromSourceId": source["sourceId"],
                            "toSourceId": target_id,
                            "created": datetime.now(),
                            "updated": datetime.now(),
                        }

                        try:
                            neo4jClient.create_connection_between_sources(
                                connectionToInsert["fromSourceId"],
                                connectionToInsert["toSourceId"],
                                connectionToInsert,
                            )
                            logger.info(f"Created connection: {connectionToInsert}")
                        except Exception as e:
                            logger.error(str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                update_process(
                    job_id=connection_proccess_id,
                    status="processing",
                    percentage=round((i + 1) / len(sources) * 100, 2),
                )

            update_process(
                job_id=connection_proccess_id,
                description="Completed parsing Obsidian links",
                status="completed",
                percentage=100,
                closeModal=True,
            )
            return True

        except Exception as e:
            update_process(
                job_id=connection_proccess_id,
                status="failed",
                description="Failed to parse Obsidian links",
                percentage=0,
                error=str(e),
            )
            logger.error(str(e))
            return False


service = SourceService()
