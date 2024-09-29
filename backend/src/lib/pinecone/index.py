from pinecone import Pinecone
from src.core.config import settings
from sentence_transformers import SentenceTransformer

PC =Pinecone(
    api_key=settings.pinecone_api_key
)

PCINDEX = PC.Index('article-embeddings')

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')