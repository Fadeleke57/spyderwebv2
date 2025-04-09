from typing import List
from uuid import uuid4
from src.models.index import Web, Connection
from src.db.neo4j import client as neo4jClient
from src.lib.pinecone.index import client as pineconeClient
from src.lib.logger.index import logger


class WebService:
    def __init__(self):
        pass

    def emebd_and_upsert_web(self, web_payload: Web) -> bool:

        try:

            vectors = pineconeClient.generate_web_embeddings(
                web_payload["name"], web_payload["description"]
            )
            pincone_insert = web_payload  # create copy so we don't modify the original

            del pincone_insert["_id"]

            pincone_insert["created"] = str(
                web_payload["created"]
            )  # data object not allowed in pinecone
            pincone_insert["updated"] = str(web_payload["updated"])
            embedding_data = [(web_payload["webId"], vectors, pincone_insert)]
            pineconeClient.index.upsert(
                vectors=embedding_data,
                namespace="webs",
            )

        except Exception as e:
            logger.error(e)
            return False

        return True

    def update_emebeddings(self, web_id: str, updatePayload) -> bool:

        try:

            vector_updates = {}
            if "name" in updatePayload:
                vector_updates["name"] = updatePayload["name"]
            if "description" in updatePayload:
                vector_updates["description"] = updatePayload["description"]
            updatePayload["updated"] = str(updatePayload["updated"])

            if vector_updates:
                vectors = pineconeClient.generate_web_embeddings(
                    vector_updates["name"], vector_updates["description"]
                )
                pineconeClient.index.update(
                    id=web_id,
                    values=vectors,
                    set_metadata=updatePayload,
                    namespace="webs",
                )
            return True

        except Exception as e:
            logger.error(e)
            return False


service = WebService()
