from src.lib.logger.index import logger
from src.constants.embedding import SOURCE_TYPE_BATCH_MAP
from src.agents.autolinking_engine.autolinker import engine as autolinker
from src.lib.pinecone.index import client as pinecone_client
from src.models.index import Source, Embeddings, EmbeddingReference, Vector
from typing import Optional, Union, Literal, Dict, Any, List
from src.utils.credits import deduct_credits
from pydantic import BaseModel
from datetime import datetime
from pytz import UTC
import time

class YoutubeChunk(BaseModel):
    text: str
    start_time: float
    end_time: float

Chunk = Union[str, YoutubeChunk]

class EmbeddingService:
    def __init__(self):
        logger.info("EMBEDDING SERVICE INITIALIZED!")

    @staticmethod
    def _map_type_to_batch_size(
        type: Literal["website", "youtube", "document", "note", "voice_note"]
    ) -> int:
        return SOURCE_TYPE_BATCH_MAP.get(type, 50)

    @staticmethod
    def _generate_source_chunk_metadata(
        source: Source,
        chunk: Chunk,
        index: int,
        number_of_chunks: int,
        page_number: Optional[int] = None,
    ) -> Dict[str, Any]:
        type = source.type

        base_metadata = {
            "sourceId": source.sourceId,
            "webId": source.webId,
            "userId": source.userId,
            "chunkIndex": index,
            "chunkCount": number_of_chunks,
            "type": type,
            "url": source.url,
            "text": chunk.text if type == "youtube" else chunk,
            "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        }

        metadata = base_metadata.copy()
        if type == "website":
            metadata["websiteTitle"] = source.name

        elif type == "youtube":
            metadata["videoTitle"] = source.name
            metadata["videoDescription"] = source.content
            metadata["startTime"] = chunk.start_time
            metadata["endTime"] = chunk.end_time

        elif type == "document":
            metadata["documentTitle"] = source.name
            metadata["pageNumber"] = page_number
            metadata["pdfSize"] = source.size

        elif type == "note":
            metadata["noteTitle"] = source.name

        elif type == "voice_note":
            metadata["voiceNoteTitle"] = source.name

        return metadata

    def _start_embedding(
        self, source: Source, chunks: List[Chunk], page_number: Optional[int] = None
    ):
        if not source or not chunks:  # check if source or chunks are missing
            logger.error("Source or chunks are missing")
            raise ValueError("Source or chunks are missing")

        source = Source(**source)
        source_id = source.sourceId
        web_id = source.webId
        user_id = source.userId

        vectors: List[Vector] = []  # list of (chunk_id, embedding, metadata)
        should_run_autolinker: bool = False

        """
        success, _ = deduct_credits(
            user_id, "autolinker"
        )  # deduct credits for autolinker
        if success:
            should_run_autolinker = True
            autolinker.configure(web_id, source_id)
        """

        num_chunks = len(chunks)

        for i, chunk in enumerate(chunks):
            chunk_id = (
                f"{source_id}:chunk{i}:page{page_number}"
                if page_number
                else f"{source_id}:chunk{i}"
            )
            logger.info(f"Uploading chunk: {chunk_id}")

            # reference to the chunk in mongo for update and delete operations later on
            mongo_embedding = EmbeddingReference(
                sourceId=source_id,
                webId=web_id,
                embeddingId=chunk_id,
            )
            Embeddings.insert_one(mongo_embedding.model_dump())

            metadata = self._generate_source_chunk_metadata(
                source=source,
                chunk=chunk,
                index=i,
                number_of_chunks=num_chunks,
                page_number=page_number,
            )
            chunk = chunk.text if source.type == "youtube" else chunk

            embeddings = self.client.inference.embed(
                model="multilingual-e5-large",
                inputs=[chunk + " " + source.name + " " + source.type],
                parameters={"input_type": "passage", "truncate": "END"},
            )
            embedding = embeddings.data[0].values

            if should_run_autolinker:
                autolinker.add_vector_to_stage(Vector(chunk_id, embedding, metadata))
            
            vectors.append(Vector(chunk_id, embedding, metadata))

        batch_size = self._map_type_to_batch_size(source.type)
        results = []

        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            try:
                response = self.index.upsert(
                    vectors=batch,
                    namespace="sources",
                    batch_size=batch_size,
                )
                results.append(response)

                if i + batch_size < len(vectors):
                    time.sleep(0.5)

            except Exception as e:
                logger.error(f"Error embedding and upserting to Pinecone: {str(e)}")
                raise

        if should_run_autolinker:
            autolinker.run()
        return results


service = EmbeddingService()
