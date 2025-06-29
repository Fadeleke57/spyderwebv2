import re
from uuid import uuid4
from datetime import datetime
from typing_extensions import deprecated
from typing import List, Any, Optional
from fastapi import HTTPException
from src.models.index import Source, Webs, Sources
from src.service.chunking import service as chunking_service
from src.service.embedding import service as embedding_service
from src.service.extraction import service as extraction_service
from src.db.neo4j import client as neo4jClient
from src.lib.logger.index import logger
from fastapi import BackgroundTasks
from pytz import UTC
from src.constants.source import DOCUMENT_TYPES, MEMORY_TRANSCRIPT
from src.constants.source import create_onboarding_sources


class SourceService:
    def __init__(self):
        logger.info("SOURCE SERVICE INITIALIZED!")

    def create_source(self, **kwargs):
        sourceId = str(uuid4())
        return Source(sourceId=sourceId, **kwargs)

    def process_source(
        self, source: Source, content_to_embed: Any, file_path: Optional[str] = None
    ):
        """
        Processes a source document and embeds it into Pinecone.

        Args:
            source (Source): The source document to process.

        Returns:
            None
        """
        if not content_to_embed and not file_path:
            logger.info("No content to embed...Skipping.")
            return

        if source.type in {"youtube"}:
            chunks = chunking_service.chunk_youtube_transcript(content_to_embed)
        elif source.type in {"website", "note", "voice_note"}:
            chunks = chunking_service.chunk_cleaned_md(content_to_embed)
        elif source.type in DOCUMENT_TYPES:
            if not file_path:
                raise HTTPException(
                    status_code=400, detail="File path is required to process PDF"
                )
            logger.info(f"Processing document at path: {file_path}")
            content_to_embed = extraction_service.extract_document_content(file_path)
            logger.info(f"Found {len(content_to_embed)} pages in document")
            chunks = chunking_service.chunk_document_pages(content_to_embed)
            logger.info(f"Found {len(chunks)} chunks in document")

        if chunks:
            embedding_service.run_embedding_process(source=source, chunks=chunks)
            logger.info(f"SOURCE PROCESSED: {source.sourceId}")

    def parse_obsidian_links(self, web_id: str, sources: List[Source]) -> bool:
        """
        Parse Obsidian links from a list of sources and create connections between them.

        This function will iterate over all sources in the given list, and for each source,
        it will search for Obsidian-style links in the source content. If the target of a link
        is found in the same list of sources, a connection will be created between the two
        sources in the Neo4j database.

        Args:
            web_id (str): The ID of the web containing the sources.
            sources (List[Source]): A list of sources to parse.

        Returns:
            bool: True if the function was successful, False otherwise.
        """
        try:

            for i, source in enumerate(sources):
                linkPattern = r"\[\[(.*?)(?:\|.*?)?(?:#.*?)?\]\]"
                embedPattern = r"!\[\[(.*?)(?:\|.*?)?(?:#.*?)?\]\]"

                for match in re.finditer(linkPattern, source.content):
                    logger.info(f"Match: {match.group(1)}")
                    target_filename = match.group(1).split("|")[0].split("#")[0].strip()
                    target_source = next(
                        (s for s in sources if s.name.strip() == target_filename),
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
                            "fromSourceId": source.sourceId,
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

                for match in re.finditer(embedPattern, source.content):
                    logger.info(f"Match: {match.group(1)}")
                    target_filename = match.group(1).split("|")[0].split("#")[0].strip()
                    target_source = next(
                        (s for s in sources if s.name.strip() == target_filename),
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
                            "fromSourceId": source.sourceId,
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

            return True

        except Exception as e:
            logger.error(str(e))
            return False

    def embed_iterated_sources(self, sourceIds: List[str]):
        pass

    def create_onboarding_sources(
        self, web_id: str, user_id: str, background_tasks: BackgroundTasks
    ):
        sources_to_insert = create_onboarding_sources(web_id, user_id)
        neo4jClient.create_many_nodes(
            "source", [s.model_dump() for s in sources_to_insert]
        )
        for source in sources_to_insert:
            background_tasks.add_task(
                self.process_source,
                source=source,
                content_to_embed=(
                    source.content
                    if not source.type == "youtube"
                    else MEMORY_TRANSCRIPT
                ),
                file_path=None,
            )

        source_ids = [source.sourceId for source in sources_to_insert]
        Webs.update_one(
            {"webId": web_id},
            {
                "$push": {"sourceIds": {"$each": source_ids}},
                "$set": {"updated": datetime.now(UTC)},
            },
        )

        return True


service = SourceService()
