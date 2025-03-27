from pinecone import Pinecone
from src.core.config import settings
from datetime import datetime
from pytz import UTC
from typing import List, Dict, Any, Literal, Optional
import re
import time
from src.lib.logger.index import logger
from src.agents.autolinking_engine.autolinker import engine as autolinker


class PineconeClient:
    def __init__(self):
        self.client = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.client.Index(name=settings.pinecone_index_name)

    @staticmethod
    def _map_type_to_batch_size(type: Literal["website", "youtube", "document"]) -> int:
        """
        Maps the given type to the batch size for uploading to Pinecone.

        Args:
        - type (Literal["website", "youtube", "document"]): The type of data to upload.

        Returns:
        - int: The batch size for uploading the given type of data.
        """
        if type == "website":
            return 50
        elif type == "youtube":
            return 20
        elif type == "document":
            return 50
        return 40


    """
        @staticmethod
        def _map_type_to_metadata(
            type: Literal["website", "youtube", "document", "note"],
            chunks: list,
            source_id: str,
            index: int,
            chunk: str,
            title: str,
            url: Optional[str] = None,
        ) -> Dict[str, Any]:
            chunk_count = len(chunks)

            if type == "website":
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": index,
                    "chunkCount": chunk_count,
                    "type": type,
                    "url": str(url) if url else None,
                    "text": chunk[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
            elif type == "youtube":
                chunk_text = chunk["text"]
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": index,
                    "chunkCount": chunk_count,
                    "type": type,
                    "url": str(url) if url else None,
                    "text": chunk_text[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                    "start_time": chunks[index]["start_time"],
                    "end_time": chunks[index]["end_time"],
                }
                chunk = chunk_text
            elif type == "document":
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": index,
                    "chunkCount": chunk_count,
                    "type": type,
                    "url": str(url) if url else None,
                    "text": chunk[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
            elif type == "note":
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": index,
                    "chunkCount": chunk_count,
                    "type": type,
                    "name": title,
                    "text": chunk[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
            return metadata
    """


    def run_semantic_search(self, query: str, limit: int, filter):
        """
        Runs a semantic search over the Pinecone index using the given query.

        Args:
        - query (str): The query string to search for.
        - limit (int): The maximum number of results to return.
        - filter (Dict[str, Any]): A filter to apply on the results. The filter should be a dictionary
            where each key is a metadata key and the value is a filter value.

        Returns:
        - List[Dict[str, Any]]: A list of dictionaries, each representing a result. The dictionary will
            contain the metadata of the result, as well as an "id" key containing the ID of the result.
        """
        query_embedding = self.get_query_embedding(query)
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
        return results

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

    def chunk_youtube_transcript(self, transcript_data, chunk_duration: float = 90.0):
        """
        Chunk transcript by time intervals.

        Args:
            transcript_data: List of transcript segments with 'text', 'start', 'duration'
            chunk_duration: Duration of each chunk in seconds

        Returns:
            List of chunked transcript segments with text, start time, and end time
        """
        chunks = []

        # total duration of the video
        total_duration = transcript_data[-1]["start"] + transcript_data[-1]["duration"]

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
                segment_start = segment["start"]
                segment_end = segment_start + segment["duration"]

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

    """
        def _embed_chunk(self, chunk: str) -> list[float]:
            try:
                embedding_response = self.client.inference.embed(
                    model="multilingual-e5-large",
                    inputs=[chunk],
                    parameters={"input_type": "passage", "truncate": "END"},
                )
                embedding = embedding_response.data[0].values
                return embedding
            except Exception as e:
                logger.error(f"Error embedding chunk: {e}")
                return None
    """


    def embed_and_upsert_to_pinecone(
        self,
        source_id: str,
        chunks: list,
        web_id: str,
        type: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
    ):
        """
        Embed text chunks using Pinecone's embedding service and upsert them directly.

        Args:
            source_id (str): ID of the source document
            chunks (list): List of text chunks
            web_id (str): Web ID to use as namespace

        Returns:
            dict: Pinecone API response
        """
        vectors = []
        autolinker.configure(web_id, source_id)

        for i, chunk in enumerate(chunks):
            chunk_id = f"{source_id}:chunk{i}"
            logger.info(f"Uploading chunk: {chunk_id}")

            if type == "website":
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": i,
                    "chunkCount": len(chunks),
                    "type": type,
                    "url": str(url) if url else None,
                    "text": chunk[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
            elif type == "youtube":
                chunk_text = chunk["text"]
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": i,
                    "chunkCount": len(chunks),
                    "type": type,
                    "url": str(url) if url else None,
                    "text": chunk_text[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                    "start_time": chunks[i]["start_time"],
                    "end_time": chunks[i]["end_time"],
                }
                chunk = chunk_text
            elif type == "document":
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": i,
                    "chunkCount": len(chunks),
                    "type": type,
                    "url": str(url) if url else None,
                    "text": chunk[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
            elif type == "note":
                metadata = {
                    "sourceId": source_id,
                    "chunkIndex": i,
                    "chunkCount": len(chunks),
                    "type": type,
                    "name": title,
                    "text": chunk[:1000],
                    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }

            embeddings = self.client.inference.embed(
                model="multilingual-e5-large",
                inputs=[chunk],
                parameters={"input_type": "passage", "truncate": "END"},
            )
            embedding = embeddings.data[0].values
            
            autolinker.add_vector_to_stage((chunk_id, embedding, metadata))
            vectors.append((chunk_id, embedding, metadata))

        batch_size = self._map_type_to_batch_size(type)
        results = []

        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            try:
                response = self.index.upsert(
                    vectors=batch,
                    namespace=web_id,
                    batch_size=batch_size,
                )
                results.append(response)

                # small delay between batches
                if i + batch_size < len(vectors):
                    time.sleep(0.5)

            except Exception as e:
                logger.error(f"Error embedding and upserting to Pinecone: {str(e)}")
                raise

        autolinker.run()
        return results


client = PineconeClient()
