from src.lib.pinecone.index import client as pineconeClient


### execute semantic search
def run_semantic_search(query: str, limit: int, filter):
    query_embedding = pineconeClient.get_query_embedding(query)
    pinecone_response = pineconeClient.index.query(
        vector=query_embedding,
        top_k=limit,
        include_metadata=True,
        namespace="webs",
        filter=filter,
    )
    results = []
    for match in pinecone_response["matches"]:
        result = match["metadata"]
        result["id"] = match["id"]
        results.append(result)
    return results
