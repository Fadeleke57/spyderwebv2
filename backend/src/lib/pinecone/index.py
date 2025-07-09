import time
from pinecone.grpc import PineconeGRPC as Pinecone
from src.core.config import settings
from typing import Dict, Any, Literal, List
from src.lib.logger.index import logger
from src.models.index import Vector
import traceback
from src.constants.index import DOCUMENT_TYPES, ACCEPTED_SOURCE_KEYS, ACCEPTED_WEB_KEYS


class PineconeClient:
    def __init__(self):
        self.client = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.client.Index(name=settings.pinecone_index_name)
        self.embedding_model = "multilingual-e5-large"

    @staticmethod
    def _clean_metadata(metadata: dict) -> dict:
        """
        Clean the metadata dictionary by removing any keys that are not allowed.
        """
        keys = metadata.keys()
        source_type = metadata.get("type")
        result = {}
        for key in keys:
            if key in ACCEPTED_WEB_KEYS or key in ACCEPTED_SOURCE_KEYS:
                value = metadata[key]
                result[key] = (
                    (value[:200] if value else "") + "..."
                    if key == "videoDescription"
                    else value
                )
        if source_type and source_type in DOCUMENT_TYPES:
            if result.get("url"):
                del result["url"]

        return result

    def embed(
        self, text: str, embedding_type: Literal["passage", "query"] = "passage"
    ) -> List[float]:
        if embedding_type not in {"passage", "query"}:
            raise ValueError("Invalid type. Must be 'passage' or 'query'")

        paramaters = {
            "input_type": embedding_type,
        }

        if embedding_type == "passage":
            paramaters["truncate"] = "END"

        embeddings = self.client.inference.embed(
            model=self.embedding_model,
            inputs=[text],
            parameters=paramaters,
        )
        return embeddings.data[0].values

    def upsert(
        self, vectors: List[Vector], namespace: str = "sources", batch_size: int = 20
    ):
        results = []
        logger.info(f"Upserting to pinecone with a batch size of {batch_size}")
        for i in range(0, len(vectors), batch_size):
            logger.info(
                f"Upserting batch {i // batch_size + 1} of {len(vectors) // batch_size + 1}"
            )
            batch = vectors[i : i + batch_size]

            try:
                response = self.index.upsert(
                    vectors=batch,
                    namespace=namespace,
                    batch_size=batch_size,
                )
                results.append(response)

                if i + batch_size < len(vectors):
                    time.sleep(0.5)

            except Exception as e:
                traceback.print_exc()
                logger.error(f"Error embedding and upserting to Pinecone: {str(e)}")

        logger.info(f"Upserted {len(vectors)} vectors to Pinecone")
        return results

    def run_semantic_search(
        self,
        query: str,
        namespace: str,
        filter: Dict[str, Any] = {},
        limit: int = 10,
    ):
        """
        Runs a semantic search on the Pinecone index for a given namespace ('webs' or 'sources').

        Args:
            query (str): The query string to search for.
            namespace (str): The namespace to search within ('webs' or 'sources').
            filter (Dict[str, Any], optional): A dictionary of metadata filters to apply. Defaults to {}.
            limit (int, optional): The number of results to return. Defaults to 10.

        Returns:
            list: A list of cleaned metadata dictionaries, each including an 'id' key.
        """
        logger.info(
            f"Performing semantic search in namespace '{namespace}' for query: {query}, filter: {filter}, limit: {limit}"
        )

        query_embedding = self.embed(query, "query")

        pinecone_response = self.index.query(
            vector=query_embedding,
            top_k=limit,
            include_metadata=True,
            namespace=namespace,
            filter=filter,
        )

        results = []
        for match in pinecone_response["matches"]:
            result = match["metadata"]
            result["id"] = match["id"]
            results.append(result)

        cleaned_results = [self._clean_metadata(result) for result in results]

        logger.info(f"Semantic search results: {cleaned_results}")
        return cleaned_results


client = PineconeClient()
