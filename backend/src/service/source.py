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
import time

class SourceService:
    def __init__(self):
        pass

    def embed_and_upsert_website(self, source: Source, md: str):

        try:

            chunks = pineconeClient.chunk_clean_text(md)

            results = pineconeClient.embed_and_upsert_to_pinecone(
                source=source, chunks=chunks, user_id=source["userId"]
            )

            logger.info(f"Pinecone results: {results}")

        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def embed_and_upsert_youtube(self, source: Source, transcripts: List[str]):
        if not source or not transcripts:
            raise HTTPException(
                status_code=404, detail="Source item not created or found"
            )

        try:
            chunks = pineconeClient.chunk_youtube_transcript(transcripts)
            results = pineconeClient.embed_and_upsert_to_pinecone(
                source=source, chunks=chunks, user_id=source["userId"]
            )
            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def embed_and_upsert_pdf(self, file_path: str, source: Source):
        try:

            # extract Markdown for each page as a list of dictionaries
            data = pymupdf4llm.to_markdown(
                file_path, page_chunks=True
            )  # returns a list

            os.remove(file_path)
            if not data:
                logger.info("No text found in PDF")
                return

            for index, page_data in enumerate(data):
                page_number = index + 1

                chunks = pineconeClient.chunk_clean_text(
                    text=page_data["text"], chunk_size=1000, chunk_overlap=100
                )

                results = pineconeClient.embed_and_upsert_to_pinecone(
                    source=source,
                    chunks=chunks,
                    user_id=source["userId"],
                    page_number=page_number,
                )

            logger.info(f"Pinecone results: {results}")

        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

    def embed_and_upsert_note(self, source: Source, text: str):
        try:
            chunks = pineconeClient.chunk_clean_text(
                text=text, chunk_size=1000, chunk_overlap=50
            )
            results = pineconeClient.embed_and_upsert_to_pinecone(
                source=source, chunks=chunks, user_id=source["userId"]
            )

            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")
        
    def refresh_note_embeddings(self, source: Source, content: str):
        try:
            all_ids = []

            for id in pineconeClient.index.list(namespace=source["webId"]):
                all_ids.extend(id)

            if not all_ids:
                logger.info(f"No vectors found for this web: {source['webId']}. Nothing to update")
                return True
            
            batch_size = 999
            ids_to_delete = []
            for i in range(0, len(all_ids), batch_size):
                batch_ids = all_ids[i:i+batch_size]
                fetch_response = pineconeClient.index.fetch(ids=batch_ids, namespace=source["webId"])

                for vid, record in fetch_response.vectors.items():
                    metadata = record.metadata
                    embedding_sourceId = metadata.get("sourceId")

                    if embedding_sourceId == source["sourceId"]:
                        ids_to_delete.append(vid)

            logger.info(f"Deleting {len(ids_to_delete)} embeddings")

            pineconeClient.index.delete(
                ids=ids_to_delete,
                namespace=source["webId"],
            )

            self.embed_and_upsert_note(source, content)
            logger.info("Refreshed note chunks successfully")
            return True
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            return False
        
    def delete_source_embeddings(self, source: Source):
        try:
            all_ids = []

            for id in pineconeClient.index.list(namespace=source["webId"]):
                all_ids.extend(id)

            if not all_ids:
                logger.info(f"No vectors found for this web: {source['webId']}. Nothing to update")
                return True
            
            batch_size = 999
            ids_to_delete = []
            for i in range(0, len(all_ids), batch_size):
                batch_ids = all_ids[i:i+batch_size]
                fetch_response = pineconeClient.index.fetch(ids=batch_ids, namespace=source["webId"]) # update to query with metadata filtering in the future for faster fetches

                for vid, record in fetch_response.vectors.items():
                    metadata = record.metadata
                    if not metadata:
                        continue
                    embedding_sourceId = metadata.get("sourceId")

                    if embedding_sourceId == source["sourceId"]:
                        ids_to_delete.append(vid)

            logger.info(f"Deleting {len(ids_to_delete)} embeddings")

            try:
                if ids_to_delete:
                    pineconeClient.index.delete(
                        ids=ids_to_delete,
                        namespace=source["webId"],
                    )
            except Exception as e:
                logger.error(f"Error deleting embeddings: {e}")
                return False

            logger.info("Deleted note chunks successfully")
            return True
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            return False
    
    def refresh_metadata(self, webId: str, sourceId: str, metadata: dict):
        logger.info(f"Updating source metadata: {metadata}")
        try:
            pinecone_safe_metadata = metadata.copy()
            del pinecone_safe_metadata["updated"]

            all_ids = []
            for id in pineconeClient.index.list(namespace=webId):
                all_ids.extend(id)

            if not all_ids:
                logger.info(f"No vectors found for this web: {webId}. Nothing to update")
                return True
            
            batch_size = 999
            for i in range(0, len(all_ids), batch_size):
                batch_ids = all_ids[i:i+batch_size]
                fetch_response = pineconeClient.index.fetch(ids=batch_ids, namespace=webId)

                for vid, record in fetch_response.vectors.items():

                    metadata = record.metadata
                    embedding_sourceId = metadata.get("sourceId")

                    if embedding_sourceId == sourceId:
                        pineconeClient.index.update(
                            id=vid,
                            set_metadata=pinecone_safe_metadata,
                            namespace=webId,
                        )
                        logger.info(f"Updated source metadata for {vid}")

                time.sleep(0.1)

            logger.info("Updated source metadata successfully")
            return True
        except Exception as e:
            logger.error(f"Error updating source metadata: {e}")
            return False
        

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
                            "description": "Obsidian reference",
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
                            "description": "Obsidian reference",
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

    def embed_and_upsert_voice_note(self, source: Source, text: str):
        """
        Create embeddings for voice note transcription and store in Pinecone.
        Following the same pattern as notes since we're dealing with text content.

        Args:
            source (Source): The source document
            text (str): The transcribed text (similar to note content)
        """
        try:
            # Use exact same chunking as notes
            chunks = pineconeClient.chunk_clean_text(
                text=text,
                chunk_size=1000,
                chunk_overlap=50
            )
            results = pineconeClient.embed_and_upsert_to_pinecone(
                source=source,
                chunks=chunks,
                user_id=source["userId"]
            )

            logger.info(f"Pinecone results: {results}")
        except Exception as e:
            logger.error(f"Error processing Pinecone embeddings: {e}")
            raise RuntimeError(f"Error processing Pinecone embeddings: {e}")

service = SourceService()
