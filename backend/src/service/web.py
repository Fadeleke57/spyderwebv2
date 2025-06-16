from src.models.index import Embeddings
from src.lib.pinecone.index import client as pineconeClient
from src.lib.logger.index import logger
from src.db.neo4j import client as neo4jClient
from src.utils.storage import (
    handleEmbeddingStorage,
    handleFileStorage,
    handleTextStorage,
)


class WebService:
    def __init__(self):
        pass

    def emebd_and_upsert_web(self, web_payload: dict) -> bool:
        """
        Embed and upsert a web payload into the Pinecone index.

        This function generates vector embeddings for a given web's name and description,
        then prepares and inserts the data into the Pinecone index. The web payload's
        '_id' field is removed before insertion, and date objects are converted to strings
        to comply with Pinecone requirements. Null values are replaced with the string "None".

        Args:
            web_payload (dict): A dictionary containing the web's data,
                including 'name', 'description', 'webId', 'created', and 'updated' fields.

        Returns:
            bool: True if the operation is successful, otherwise False.
        """

        try:

            vectors = pineconeClient.generate_web_embeddings(
                web_payload["name"], web_payload["description"]
            )
            pincone_insert = (
                web_payload.copy()
            )  # create copy so we don't modify the original

            del pincone_insert["_id"]

            # convert to string bc date object not allowed in pinecone
            pincone_insert["created"] = str(web_payload["created"])
            pincone_insert["updated"] = str(web_payload["updated"])

            # remove all null values
            for key, value in pincone_insert.items():
                if value is None:
                    pincone_insert[key] = "None"

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
        """
        Updates a web's embeddings and metadata in Pinecone.

        Args:
            web_id (str): The ID of the web to update.
            updatePayload (dict): A dictionary containing the fields to update.

        Returns:
            bool: True if the update was successful, False otherwise.
        """
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

    def delete_attached_sources(self, webId: str, userId: str) -> bool:
        """
        Deletes all sources attached to a given web, and rollbacks the associated file and text storage.

        Args:
            webId (str): The ID of the web to delete sources from.
            userId (str): The ID of the user who owns the web.

        Returns:
            int: The total number of bytes deleted from storage.
        """
        try:
            total_file_bytes = 0
            total_text_content = ""

            web_sources = neo4jClient.get_nodes_by_properties(
                "source", {"webId": webId}
            )

            for source in web_sources:
                if source["type"] in ("document", "voice_note"):
                    total_file_bytes += source.get("size", 0)  # raw file size from S3
                else:
                    total_text_content += source.get("content", "") or ""

            # Delete nodes
            neo4jClient.delete_nodes_by_properties("source", {"webId": webId})

            # Rollback file storage
            if total_file_bytes > 0:
                handleFileStorage(
                    fileSizeBytes=total_file_bytes,
                    userId=userId,
                    operation="$dec",
                )

            # Rollback text storage
            if total_text_content:
                handleTextStorage(
                    extractedText=total_text_content,
                    userId=userId,
                    operation="$dec",
                )

            logger.info(f"Deleted {len(web_sources)} sources from Neo4j")
            return total_file_bytes + len(
                total_text_content.encode("utf-8")
            )  # Return total bytes deleted

        except Exception as e:
            logger.error(f"Error deleting attached sources for web {webId}: {e}")
            return ""

    def delete_web_embeddings(self, webId: str, userId: str) -> bool:
        """
        Deletes all embeddings associated with a given web, including the web's vector index entry, all source embeddings,
        and metadata from Mongo. Also rollbacks the associated file and text storage used by the web.

        Args:
            webId (str): The ID of the web to delete embeddings from.
            userId (str): The ID of the user who owns the web.

        Returns:
            bool: True if the embeddings were successfully deleted, False otherwise.
        """
        if not webId or not userId:
            raise ValueError("webId and userId are required")

        try:
            totalBytesDeleted = self.delete_attached_sources(webId, userId)

            # Delete vector index entry for the web
            pineconeClient.index.delete(ids=[webId], namespace="webs")

            # Delete source embeddings in Pinecone
            sourceEmbeddings = Embeddings.find({"webId": webId})
            sourceIdsToDelete = [e["embeddingId"] for e in sourceEmbeddings]

            if sourceIdsToDelete:
                pineconeClient.index.delete(ids=sourceIdsToDelete, namespace="sources")

                handleEmbeddingStorage(
                    sizeBytes=totalBytesDeleted,
                    userId=userId,
                    operation="$dec",
                )

            # Delete metadata from Mongo
            Embeddings.delete_many({"webId": webId})
            logger.info(f"Cleaned up embeddings in Pinecone and Mongo for web {webId}")

            return True

        except Exception as e:
            logger.error(f"Error deleting web embeddings for web {webId}: {e}")
            return False


service = WebService()
