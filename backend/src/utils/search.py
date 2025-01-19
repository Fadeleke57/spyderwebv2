from src.lib.pinecone.index import PCINDEX, get_embedding

### execute semantic search
def run_semantic_search(query: str, limit: int):
    query_embedding = get_embedding(query)
    pinecone_response = PCINDEX.query(
        vector=query_embedding, top_k=limit, include_metadata=True
    )
    results = []
    for match in pinecone_response["matches"]:
        result = match["metadata"]
        result["id"] = match["id"]
        results.append(result)
    return results