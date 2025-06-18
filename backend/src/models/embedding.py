from src.db.mongodb import get_collection
from pydantic import BaseModel
from typing import Dict, Any, List

class EmbeddingReference(BaseModel):
    sourceId: str
    webId: str
    embeddingId: str

class Vector(BaseModel):
    id: str
    metadata: Dict[str, Any]
    embedding: List[float]
    
Embeddings = get_collection("embeddings")
