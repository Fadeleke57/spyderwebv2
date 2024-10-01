from pinecone.grpc import PineconeGRPC as Pinecone
from src.core.config import settings

PC = Pinecone(
    api_key=settings.pinecone_api_key
)

PCINDEX = PC.Index('article-embeddings2')

def get_embedding(query : str):
    embedding = PC.inference.embed(
        model="multilingual-e5-large",
        inputs=[query],
        parameters={
            "input_type": "query"
        }
    )
    return embedding[0].values