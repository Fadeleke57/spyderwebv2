from pinecone import Pinecone
from src.core.config import settings

PC =Pinecone(
    api_key=settings.pinecone_api_key
)

PCINDEX = PC.Index('article-embeddings')