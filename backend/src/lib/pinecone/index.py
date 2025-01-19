from pinecone import Pinecone
from src.core.config import settings

PC = Pinecone(api_key=settings.pinecone_api_key)

PCINDEX = PC.Index(name=settings.pinecone_index_name)


def get_embedding(query: str):
    """
    Generate a vector embedding for a given query string using the Pinecone
    multilingual-e5-large model.

    Args:
        query (str): The query string to generate an embedding for.

    Returns:
        List[float]: A list of float values representing the embedding of the query.
    """
    embedding = PC.inference.embed(
        model="multilingual-e5-large",
        inputs=[query],
        parameters={"input_type": "query"},
    )
    return embedding[0].values
