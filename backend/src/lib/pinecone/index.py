from pinecone.grpc import PineconeGRPC as Pinecone
from src.core.config import settings
from datetime import datetime
from pytz import UTC
from typing import Dict, Any, Literal, Optional
import re
import time
from src.lib.logger.index import logger
from src.agents.autolinking_engine.autolinker import engine as autolinker
from src.models.index import Source, Embeddings
from src.utils.storage import handleEmbeddingStorage
from src.utils.credits import deduct_credits
from fastapi import HTTPException
from src.utils.context import clean_metadata
from src.lib.youtube.index import YoutubeTranscriptSnippet

SOURCE_TYPE_BATCH_MAP = {
    "website": 50,
    "youtube": 20,
    "document": 50,
    "note": 50,
    "voice_note": 50,
}


class PineconeClient:
    def __init__(self):
        self.client = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.client.Index(name=settings.pinecone_index_name)

    @staticmethod
    def _generate_source_chunk_metadata(
        source: Dict[str, Any],
        chunk,
        index: int,
        number_of_chunks: int,
        page_number: Optional[int] = None,
    ) -> Dict[
        str, Any
    ]:  # for youtube video chunk is an object of "text" and "start_time" and "end_time"
        type = source["type"]

        base_metadata = {
            "sourceId": source["sourceId"],
            "webId": source["webId"],
            "userId": source["userId"],
            "chunkIndex": index,
            "chunkCount": number_of_chunks,
            "type": type,
            "url": source.get("url", None),
            "text": chunk,
            "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        }

        metadata = base_metadata.copy()
        if type == "website":
            metadata["websiteTitle"] = source["name"]

        elif type == "youtube":
            metadata["videoTitle"] = source["name"]
            metadata["videoDescription"] = source["content"]
            metadata["startTime"] = chunk["start_time"]
            metadata["endTime"] = chunk["end_time"]

        elif type == "document":
            metadata["documentTitle"] = source["name"]
            metadata["pageNumber"] = page_number
            metadata["pdfSize"] = source["size"]

        elif type == "note":
            metadata["noteTitle"] = source["name"]

        elif type == "voice_note":
            metadata["voiceNoteTitle"] = source["name"]

        return metadata

    @staticmethod
    def _map_type_to_batch_size(
        type: Literal["website", "youtube", "document", "note", "voice_note"]
    ) -> int:
        """
        Maps the given type to the batch size for uploading to Pinecone.

        Args:
        - type (Literal["website", "youtube", "document", "note", "voice_note"]: The type of data to upload.

        Returns:
        - int: The batch size for uploading the given type of data.
        """

        return SOURCE_TYPE_BATCH_MAP.get(type, 50)

    def run_semantic_web_search(
        self, query: str, filter: Dict[str, Any] = {}, limit: int = 10
    ):
        """
        Runs a semantic search on the Pinecone index for webs, given a query string and an optional filter.

        Args:
            query (str): The query string to search for.
            filter (Dict[str, Any]): A filter to apply on the results. The filter should be a dictionary
                where each key is a metadata key and the value is a filter value.
            limit (int): The number of results to return. Defaults to 10.

        Returns:
            list: A list of dictionaries, each containing the metadata of a result, as well as its ID.
        """
        query_embedding = self.get_query_embedding(query)

        logger.info(
            f"Performing semantic search for query: {query}, filter: {filter}, limit: {limit}"
        )

        pinecone_response = self.index.query(
            vector=query_embedding,
            top_k=limit,
            include_metadata=True,
            namespace="webs",
            filter=filter,
        )
        results = []
        for match in pinecone_response["matches"]:
            result = match["metadata"]
            result["id"] = match["id"]
            results.append(result)

        to_clean = []
        for result in results:
            to_clean.append(clean_metadata(result))

        return to_clean

    def run_semantic_source_search(
        self,
        query: str,
        filter: Dict[str, Any] = {},
        limit: int = 10,
    ):
        logger.info(
            f"Performing semantic search for query: {query}, filter: {filter}, limit: {limit}"
        )
        query_embedding = self.get_query_embedding(query)
        pinecone_response = self.index.query(
            vector=query_embedding,
            top_k=limit,
            include_metadata=True,
            namespace="sources",
            filter=filter,
        )
        results = []
        for match in pinecone_response["matches"]:
            result = match["metadata"]
            result["id"] = match["id"]
            results.append(result)

        to_clean = []
        for result in results:
            to_clean.append(clean_metadata(result))

        logger.info(f"Semantic search results: {to_clean}")
        return to_clean

    def get_query_embedding(self, query: str):
        """
        Generate a vector embedding for a given query string using the Pinecone
        multilingual-e5-large model.

        Args:
            query (str): The query string to generate an embedding for.

        Returns:
            List[float]: A list of float values representing the embedding of the query.
        """
        embedding = self.client.inference.embed(
            model="multilingual-e5-large",
            inputs=[query],
            parameters={"input_type": "query"},
        )
        return embedding[0].values

    def generate_web_embeddings(
        self, name: str, description: str, header_weight: int = 3
    ) -> any:
        """
        Generate vector embeddings by giving more weight to the header.
        """
        weighted_input = (name + " ") * header_weight + description
        embeddings = self.client.inference.embed(
            model="multilingual-e5-large",
            inputs=[weighted_input],
            parameters={"input_type": "passage", "truncate": "END"},
        )
        return embeddings.data[0].values

    def chunk_clean_text(
        self, text: str, chunk_size: int = 500, chunk_overlap: int = 50
    ):
        """
        Split text into overlapping chunks of specified size.

        Args:
            text (str): The text to chunk
            chunk_size (int): Maximum number of characters per chunk
            chunk_overlap (int): Number of characters to overlap between chunks

        Returns:
            list: List of text chunks
        """
        # split text into sentences
        sentences = re.split(r"(?<=[.!?])\s+", text)
        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_length = len(sentence)

            # if adding this sentence would exceed the chunk size, finalize the current chunk
            if current_length + sentence_length > chunk_size and current_chunk:
                chunks.append(" ".join(current_chunk))

                # keep some sentences for overlap
                overlap_sentences = []
                overlap_length = 0

                # work backwards through current_chunk to create overlap
                for s in reversed(current_chunk):
                    if overlap_length + len(s) <= chunk_overlap:
                        overlap_sentences.insert(0, s)
                        overlap_length += len(s) + 1  # +1 for the space
                    else:
                        break

                current_chunk = overlap_sentences
                current_length = overlap_length

            # add the current sentence to the chunk
            current_chunk.append(sentence)
            current_length += sentence_length + 1  # +1 for the space

        # add the last chunk if it's not empty
        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def chunk_youtube_transcript(
        self,
        transcript_data: list[YoutubeTranscriptSnippet],
        chunk_duration: float = 90.0,
    ):
        """
        Chunk transcript by time intervals.

        Args:
            transcript_data: List of transcript segments with 'text', 'offset', 'duration'
            chunk_duration: Duration of each chunk in seconds

        Returns:
            List of chunked transcript segments with text, start time, and end time
        """
        chunks = []

        logger.info(f"Transcript data for video: {transcript_data}")
        # total duration of the video
        total_duration = float(transcript_data[-1]["offset"]) + float(
            transcript_data[-1]["duration"]
        )

        # create time windows
        time_windows = []
        current_time = 0

        while current_time < total_duration:
            end_time = min(current_time + chunk_duration, total_duration)
            time_windows.append((current_time, end_time))
            current_time = end_time

        # assign segments to time windows
        for start_time, end_time in time_windows:
            window_segments = []

            for segment in transcript_data:
                segment_start = float(segment["offset"])
                segment_end = segment_start + float(segment["duration"])

                # check if segment overlaps with current time window
                if segment_end > start_time and segment_start < end_time:
                    window_segments.append(segment["text"])

            if window_segments:
                chunks.append(
                    {
                        "text": " ".join(window_segments),
                        "start_time": start_time,
                        "end_time": end_time,
                    }
                )

        return chunks

    def embed_and_upsert_to_pinecone(
        self,
        source: Source,
        chunks: list[str],
        pageNumber: Optional[int] = None,
    ):
        """
        Embed text chunks using Pinecone's embedding service and upsert them directly.
        Will run autolinker only if user has sufficient credits.

        Args:
            source (Source): Source document
            chunks (list): List of text chunks
            user_id (str): User ID to check credits
            page_number (Optional[int]): Page number for PDF documents

        Returns:
            dict: Pinecone API response
        """
        sourceId = source["sourceId"]
        webId = source["webId"]
        userId = source["userId"]

        vectors = []
        should_run_autolinker = False

        success, _ = deduct_credits(userId, "autolinker")
        if success:
            should_run_autolinker = True
            autolinker.configure(webId, sourceId)

        embeddingStorageResult = handleEmbeddingStorage(
            sizeBytes=source.get(
                "size",
                (
                    len(source.get("content", "").encode("utf-8"))
                    if source.get("content")
                    else 0
                ),
            ),
            userId=userId,
            operation="$inc",
        )
        if not embeddingStorageResult:
            raise HTTPException(status_code=400, detail="Storage limit exceeded")

        num_chunks = len(chunks)

        for i, chunk in enumerate(chunks):
            chunk_id = (
                f"{sourceId}:chunk{i}:page{pageNumber}"
                if pageNumber
                else f"{sourceId}:chunk{i}"
            )
            logger.info(f"Uploading chunk: {chunk_id}")

            # add a corresponding reference to the chunk in mongo for update and delete operations later on
            mongo_embedding = {
                "sourceId": sourceId,
                "webId": webId,
                "embeddingId": chunk_id,
            }
            Embeddings.insert_one(mongo_embedding)

            metadata = self._generate_source_chunk_metadata(
                source=source,
                chunk=chunk,
                index=i,
                number_of_chunks=num_chunks,
                page_number=pageNumber,
            )
            chunk = chunk["text"] if source["type"] == "youtube" else chunk

            embeddings = self.client.inference.embed(
                model="multilingual-e5-large",
                inputs=[chunk + " " + source["name"] + " " + source.get("type", "")],
                parameters={"input_type": "passage", "truncate": "END"},
            )
            embedding = embeddings.data[0].values

            if should_run_autolinker:
                autolinker.add_vector_to_stage((chunk_id, embedding, metadata))
            vectors.append((chunk_id, embedding, metadata))

        batch_size = self._map_type_to_batch_size(source["type"])
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


client = PineconeClient()
