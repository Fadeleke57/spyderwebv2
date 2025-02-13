from src.lib.pinecone.index import PCINDEX, get_query_embedding


### execute semantic search
def run_semantic_search(query: str, limit: int, filter):
    query_embedding = get_query_embedding(query)
    pinecone_response = PCINDEX.query(
        vector=query_embedding,
        top_k=limit,
        include_metadata=True,
        namespace="buckets",
        filter=filter,
    )
    results = []
    for match in pinecone_response["matches"]:
        result = match["metadata"]
        result["id"] = match["id"]
        results.append(result)
    return results


results = run_semantic_search("Test", 10, {"visibility": "Public"})
print(results)
