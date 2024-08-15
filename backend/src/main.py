from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from src.routes.auth.index import router as auth_router
from src.routes.auth.oauth2 import get_google_token, get_google_user, manager, get_password_hash, verify_password, get_user
from src.db.mongodb import get_collection, get_item_by_id, client as mongo_client
from src.db.neo4j import driver as neo4j_driver, run_query
from src.models.user import UserCreate
from datetime import timedelta
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.DEBUG)

@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_client.server_info()  # Connect to both
    neo4j_driver.verify_connectivity()
    logging.info("Successfully connected to MongoDB and Neo4j")

    yield  # Disconnect from both
    mongo_client.close()
    neo4j_driver.close()
    logging.info("Disconnected from MongoDB and Neo4j")

app = FastAPI(lifespan=lifespan)

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")

@app.get("/")
def read_root():
    return {"message": "Welcome to SpyderWeb!"}

@app.get("/mongo/{collection_name}/{item_id}")
def read_mongo_item(collection_name: str, item_id: str):
    item = get_item_by_id(collection_name, item_id)
    if item:
        item["_id"] = str(item["_id"])  # For JSON serialization
        return item
    return {"error": "Item not found"}

@app.get("/articles/{limit}")
def read_neo4j_data(limit: int = 20):
    query = f'MATCH (n) RETURN n LIMIT {limit}'
    result = run_query(query)
    return {"result": result}