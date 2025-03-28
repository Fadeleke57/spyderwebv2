from pinecone import Pinecone
from src.lib.logger.index import logger
from src.core.config import settings


class CandidateSelectorAgent:  # visits the pincone database for sources within the same web (can configure to later search across other webs and increase performance/accuracy)
    def __new__(cls, *args, **kwargs):
        """
        Override __new__ method to always create a new instance.
        This approach prevents using singleton pattern or caching.
        """
        return super().__new__(cls)

    def __init__(self, webId: str, sourceId: str):
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
        threshold: float = 0.8,
    ):
        logger.info(f"Finding top k candidates for embedding: {embedding[:5]}...")
        raw_candidates = self._run_similiarity_search(
            embedding=embedding,
            k=k,
            web_id=self.webId,
            filter={"sourceId": {"$ne": self.sourceId}},
        )
        raw_candidates = [
            candidate for candidate in raw_candidates if candidate["score"] >= threshold
        ]
        logger.info(f"Found {len(raw_candidates)} candidates that met threshold")
        return raw_candidates

    def create_candidate_doc(self, raw_candidates, model_candidate_metadata):
        logger.info(f"Creating candidate doc...")
        candidate_document = {
            "model_candidate": model_candidate_metadata,
            "candidates_to_link": raw_candidates,
        }
        return candidate_document

    def _run_similiarity_search(
        self, embedding: list[float], web_id: str, filter, k: int = 10
    ):
        logger.info(
            f"Running similiarity search for embedding: {embedding[:5]}... with filter: {filter} and k: {k} and namespace: {web_id}"
        )
        pinecone_response = self.vectordb_index.query(
            top_k=k,
            vector=embedding,
            namespace=web_id,
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
