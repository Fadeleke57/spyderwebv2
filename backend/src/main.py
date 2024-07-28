from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from src.oauth2 import get_google_token, get_google_user, manager, get_password_hash, verify_password, get_user
from src.db.mongodb import get_collection, get_item_by_id, client as mongo_client
from src.db.neo4j import driver as neo4j_driver, run_query
from src.models.user import UserCreate
from datetime import timedelta
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.DEBUG)

OAUTH2_CLIENT_SECRET = os.getenv("OAUTH2_CLIENT_SECRET")
OAUTH2_REDIRECT_URI = os.getenv("OAUTH2_REDIRECT_URI")
OAUTH2_CLIENT_ID = os.getenv("OAUTH2_CLIENT_ID")

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

@manager.user_loader
def load_user(email: str):
    logging.debug(f"Loading user with email: {email}")
    collection = get_collection('users')
    user = get_user(collection, email)
    logging.debug(f"User found: {user}")
    return user

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

@app.get("/auth/login/google")
def login():
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        "?response_type=code"
        f"&client_id={OAUTH2_CLIENT_ID}"
        f"&redirect_uri={OAUTH2_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(google_auth_url)

@app.get("/auth/callback")
async def auth_callback(code: str):
    token_data = await get_google_token(code)
    user_data = await get_google_user(token_data["access_token"])
    email = user_data["email"]
    
    collection = get_collection('users')
    user = collection.find_one({"email": email})
    
    if not user:
        collection.insert_one({
            "username": user_data["name"],
            "full_name": user_data["name"],
            "email": user_data["email"],
            "hashed_password": None,  # No password for OAuth2 users
            "disabled": False,
        })
    
    access_token = manager.create_access_token(
        data={"sub": email},
        expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response = RedirectResponse(url=f"http://localhost:3000/auth/google-callback?token={access_token}&email={email}&name={user_data['name']}")
    manager.set_cookie(response, access_token)
    return response

@app.post('/auth/token')
def login(data: OAuth2PasswordRequestForm = Depends()):
    collection = get_collection('users')
    user = collection.find_one({"email": data.username})
    if not user or not verify_password(data.password, user['hashed_password']):
        raise InvalidCredentialsException
    access_token = manager.create_access_token(
        data={"sub": data.username},
        expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response = JSONResponse(content={"access_token": access_token}, status_code=200)
    manager.set_cookie(response, access_token)
    return response

@app.post('/auth/register')
def register(user: UserCreate):
    collection = get_collection('users')
    if collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "full_name": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "disabled": False,
    }
    collection.insert_one(user_data)
    return {"msg": "User registered successfully"}

@app.get("/auth/me")
def get_current_user(user=Depends(manager)):
    try:
        if not user:
            logging.error("User not found in /auth/me")
            raise HTTPException(status_code=401, detail="Unauthorized")
        logging.debug(f"User found in /auth/me: {user}")
        return user
    except Exception as e:
        logging.error(f"Exception in /auth/me: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")