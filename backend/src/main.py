from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.db.mongodb import get_collection, get_item_by_id, client as mongo_client
from src.db.neo4j import driver as neo4j_driver, run_query

@asynccontextmanager
async def lifespan(app: FastAPI):

    mongo_client.server_info()  #connect to both 
    neo4j_driver.verify_connectivity()
    print("Connected to MongoDB and Neo4j")

    yield #disconnect from both
    mongo_client.close()
    neo4j_driver.close()
    print("Disconnected from MongoDB and Neo4j")

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/mongo/{collection_name}/{item_id}")
def read_mongo_item(collection_name: str, item_id: str):
    item = get_item_by_id(collection_name, item_id)
    if item:
        item["_id"] = str(item["_id"])  #for JSON serialization
        return item
    return {"error": "Item not found"}

@app.get("/neo4j")
def read_neo4j_data():
    query = "MATCH (n) RETURN n LIMIT 10"
    result = run_query(query)
    return {"result": result}