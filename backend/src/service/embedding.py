import traceback
from src.lib.logger.index import logger
from src.constants.embedding import SOURCE_TYPE_BATCH_MAP
from src.constants.source import DOCUMENT_TYPES
from src.engine.autolinking_engine.autolinker import engine as autolinker
from src.service.chunking import Chunk
from src.lib.pinecone.index import client as pinecone_client
from src.models.index import Source, Embeddings, EmbeddingReference, Vector, Webs, Web
from typing import Literal, Dict, Any, List
from src.utils.credits import deduct_credits
from datetime import datetime
from pytz import UTC


class EmbeddingService:
    def __init__(self):
        logger.info("EMBEDDING SERVICE INITIALIZED!")

    @staticmethod
    def _map_type_to_batch_size(
        type: Literal["website", "youtube", "document", "note", "voice_note"],
    ) -> int:
        return SOURCE_TYPE_BATCH_MAP.get(type, 50)

    @staticmethod
    def _generate_source_chunk_metadata(
        source: Source,
        chunk: Chunk,
        index: int,
        number_of_chunks: int,
    ) -> Dict[str, Any]:
        type = source.type
        base_metadata = {
            "sourceId": source.sourceId,
            "webId": source.webId,
            "userId": source.userId,
            "chunkIndex": index,
            "chunkCount": number_of_chunks,
            "type": type,
            "url": source.url or "",
            "text": chunk.text if type in {"youtube", "document"} else chunk,
            "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        }

        metadata = base_metadata.copy()
        if type == "website":
            metadata["websiteTitle"] = source.name

        elif type == "youtube":
            metadata["videoTitle"] = source.name
            metadata["videoDescription"] = source.description or ""
            metadata["startTime"] = chunk.start_time
            metadata["endTime"] = chunk.end_time

        elif type in DOCUMENT_TYPES:
            metadata["documentTitle"] = source.name
            metadata["pageNumber"] = chunk.pageNumber
            metadata["pdfSize"] = source.size

        elif type == "note":
            metadata["noteTitle"] = source.name

        elif type == "voice_note":
            metadata["voiceNoteTitle"] = source.name

        return metadata

    def run_embedding_process(self, source: Source, chunks: List[Chunk]):
        if not source or not chunks:  # check if source or chunks are missing
            logger.error("Source or chunks are missing")
            raise ValueError("Source or chunks are missing")

        source_id = source.sourceId
        web_id = source.webId
        vectors: List[Vector] = []

        user_id = source.userId
        associated_web = Webs.find_one({"webId": web_id})
        should_run_autolinker: bool = (
            associated_web and Web(**associated_web).enableAIConnections
        )

        if should_run_autolinker:
            able_to_run_autolinker, _ = deduct_credits(
                user_id, "autolinker"
            )  # deduct credits for autolinker
            if able_to_run_autolinker:
                autolinker.configure(web_id, source_id)

        logger.info(
            f"Running embedding process for {source.type}. It has {len(chunks)} chunks..."
        )
        for i, chunk in enumerate(chunks):
            chunk_id = (
                f"{source_id}:chunk{i}:page{chunk.pageNumber}"
                if source.type in DOCUMENT_TYPES
                else f"{source_id}:chunk{i}"
            )
            logger.info(f"Uploading chunk: {chunk_id}")

            # reference to the chunk in mongo for update and delete operations later on
            embedding_reference = EmbeddingReference(
                sourceId=source_id,
                webId=web_id,
                embeddingId=chunk_id,
            )
            Embeddings.insert_one(embedding_reference.model_dump())

            metadata = self._generate_source_chunk_metadata(
                source=source,
                chunk=chunk,
                index=i,
                number_of_chunks=len(chunks),
            )
            chunk = chunk.text if source.type in {"youtube", "document"} else chunk
            embedding = pinecone_client.embed(chunk)

            if should_run_autolinker:
                autolinker.add_vector_to_stage((chunk_id, embedding, metadata))

            vector = (chunk_id, embedding, metadata)
            vectors.append(vector)

        batch_size = self._map_type_to_batch_size(source.type)
        results = pinecone_client.upsert(vectors, batch_size=batch_size)

        if should_run_autolinker:
            autolinker.run()

        return results

    def delete_source_embeddings(self, source: Source):
        """
        Delete all embeddings associated with a given source document.

        Args:
            source (Source): The source document containing metadata for the embeddings.

        Returns:
            bool: True if the embeddings were successfully deleted, False otherwise.
        """
        source = Source(**source)
        try:
            source_embeddings = Embeddings.find({"sourceId": source.sourceId})
            source_embeddings = [EmbeddingReference(**e) for e in source_embeddings]
            source_embeddings_to_delete = [e.embeddingId for e in source_embeddings]

            logger.info(f"Deleting {len(source_embeddings_to_delete)} embeddings")

            if source_embeddings_to_delete:

                pinecone_client.index.delete(
                    ids=source_embeddings_to_delete,
                    namespace="sources",
                )

                Embeddings.delete_many({"sourceId": source.sourceId})

            logger.info(f"Deleted {source.type} chunks successfully")
            return True

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error processing Pinecone embeddings: {e}")
            return False

    def refresh_metadata(self, sourceId: str, metadata: dict):
        """
        Updates the metadata of all embeddings associated with a given source document.

        Args:
            sourceId (str): The ID of the source document containing the embeddings.
            metadata (dict): A dictionary containing the new metadata to update.

        Returns:
            bool: True if the embeddings metadata were successfully updated, False otherwise.
        """
        logger.info(f"Updating source metadata: {metadata}")
        try:
            pinecone_safe_metadata = metadata.copy()
            del pinecone_safe_metadata["updated"]

            source_embeddings = Embeddings.find({"sourceId": sourceId})
            source_embeddings_to_update = [
                EmbeddingReference(**e) for e in source_embeddings
            ]
            source_embeddings_to_update = [
                e.embeddingId for e in source_embeddings_to_update
            ]

            for embedding_to_update in source_embeddings_to_update:
                pinecone_client.index.update(
                    id=embedding_to_update,
                    set_metadata=pinecone_safe_metadata,
                    namespace="sources",
                )
                logger.info(f"Updated source metadata for {embedding_to_update}")

            logger.info("Updated source metadata successfully")
            return True
        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error updating source metadata: {e}")
            return False

    def refresh_note_embeddings(self, source: Source, new_chunks: str):
        """
        Refresh the embeddings of a note in Pinecone by deleting existing embeddings
        and creating new ones from the provided content.

        Args:
            source (Source): The source document containing metadata for the embeddings.
            content (str): The note's content to generate new embeddings from.

        Returns:
            bool: True if the embeddings were successfully refreshed, False otherwise.
        """
        source = Source(**source)
        try:

            note_embeddings = list(Embeddings.find({"sourceId": source.sourceId}))
            note_embeddings = [EmbeddingReference(**e) for e in note_embeddings]
            note_embeddings_to_delete = [e.embeddingId for e in note_embeddings]

            logger.info(f"Deleting these embeddings: {note_embeddings_to_delete}")
            logger.info(
                f"Deleting {len(note_embeddings_to_delete)} embeddings...: {note_embeddings_to_delete}"
            )

            if note_embeddings_to_delete:
                pinecone_client.index.delete(
                    ids=note_embeddings_to_delete,
                    namespace="sources",
                )
                Embeddings.delete_many({"sourceId": source.sourceId})
                logger.info("Deleted previous note embeddings!")

            self.run_embedding_process(source=source, chunks=new_chunks)
            logger.info("Refreshed note embeddings successfully")

            return True
        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error processing Pinecone embeddings: {e}")
            return False


service = EmbeddingService()
