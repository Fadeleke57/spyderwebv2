from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
from src.db.mongodb import get_collection
#from src.utils.graph import get_article_by_id, run_semantic_search
from src.utils.generation import generate_queries
#from src.db.neo4j import driver as Neo4jDriver
from src.utils.exceptions import check_user
from src.models.article import GenerateArticlesForBucketPayload
router = APIRouter()

"""
@router.post("/start/process") 
async def start_process(payload: GenerateArticlesForBucketPayload, user=Depends(manager)):
    check_user(user)
    queries = generate_queries(payload.claim)
    print("Queries: ", queries)
    result = []
    for query in queries:
        articles_for_query = run_semantic_search(query=query, limit=3)
        result += articles_for_query

    Buckets = get_collection("buckets")
    for article_record in result:
        article_id = article_record.get("id")
        if article_id is not None:
            Buckets.update_one(
                {"bucketId": payload.bucketId, "userId": user["id"]},
                {"$addToSet": {"articleIds": article_id}},
            )
        else:
            print(f"Warning: No article node found in record: {article_record}")
    return {"result": result}
"""
