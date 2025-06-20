from pinecone import Pinecone
from src.lib.logger.index import logger
from src.core.config import settings


class CandidateSelectorAgent:  # visits the pincone database for sources within the same web (can configure to later search across other webs and increase performance/accuracy)
    def __new__(cls, *args, **kwargs):
        """
        Create and return a new instance of CandidateSelectorAgent.
        Overrides the default behavior to ensure a new instance is always created.
        """
        return super().__new__(cls)

    def __init__(self, webId: str, sourceId: str):
        """
        Initialize the CandidateSelectorAgent.

        Args:
        webId (str): The Web ID to search within.
        sourceId (str): The Source ID to exclude from results.

        Raises:
        ValueError: If either webId or sourceId are missing.
        """
        if not webId or not sourceId:
            raise ValueError("Information is missing: webId or sourceId")

        self.webId = webId
        self.sourceId = sourceId
        self.vectordb = Pinecone(api_key=settings.pinecone_api_key)
        self.vectordb_index = self.vectordb.Index(name=settings.pinecone_index_name)
        logger.info("CANDIDATE SELECTOR INITIALIZED")

    def find_top_candidates(
        self,
        embedding: list[float],
        k: int = 5,
        threshold: float = 0.9,
    ):
        """
        Find top k candidates in the Pinecone index that are similar to the given embedding, excluding the given sourceId, with a minimum similarity score threshold.

        Args:
        embedding (list[float]): The embedding vector to search for similar embeddings.
        k (int): The number of candidates to return. Defaults to 5.
        threshold (float): The minimum similarity score for a candidate to be returned. Defaults to 0.8.

        Returns:
        list: A list of dictionaries, each containing the metadata of a candidate, as well as its similarity score.
        """
        logger.info(f"Finding top k candidates for embedding: {embedding[:5]}...")
        raw_candidates = self._run_similiarity_search(
            embedding=embedding,
            k=k,
            filter={"sourceId": {"$ne": self.sourceId}, "webId": self.webId},
        )
        raw_candidates = [
            candidate for candidate in raw_candidates if candidate["score"] >= threshold
        ]
        logger.info(f"Found {len(raw_candidates)} candidates that met threshold")
        return raw_candidates

    def create_candidate_doc(self, raw_candidates, model_candidate_metadata):
        """
        Create a candidate document from a list of raw candidates and metadata for the model candidate.

        Args:
        raw_candidates (list): A list of dictionaries, each containing the metadata of a candidate, as well as its similarity score.
        model_candidate_metadata (dict): The metadata of the model candidate.

        Returns:
        dict: The created candidate document containing metadata for the model candidate and the list of raw candidates.
        """
        logger.info(f"Creating candidate doc...")
        candidate_document = {
            "model_candidate": model_candidate_metadata,
            "candidates_to_link": raw_candidates,
        }
        return candidate_document

    def _run_similiarity_search(self, embedding: list[float], filter, k: int = 15):
        """
        Runs a similarity search over the Pinecone index using the given embedding.

        Args:
        - embedding (list[float]): The vector embedding to search for.
        - web_id (str): The namespace to search in.
        - filter (Dict[str, Any]): A filter to apply on the results. The filter should be a dictionary
            where each key is a metadata key and the value is a filter value.
        - k (int): The number of results to return. Defaults to 10.

        Returns:
        - list: A list of dictionaries, each containing the metadata of a result, as well as its similarity score.
        """
        logger.info(
            f"Running similiarity search for embedding: {embedding[:5]}... with filter: {filter} and k: {k}"
        )
        pinecone_response = self.vectordb_index.query(
            top_k=k,
            vector=embedding,
            namespace="sources",
            filter=filter,
            include_metadata=True,
            include_values=False,
        )
        results = []
        for match in pinecone_response["matches"]:
            result = match["metadata"]
            result["id"] = match["id"]
            result["score"] = match["score"]
            results.append(result)
        return results
