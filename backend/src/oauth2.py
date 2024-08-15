import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer, OAuth2PasswordBearer
from fastapi_login import LoginManager
from passlib.context import CryptContext
from aiohttp import ClientSession
from dotenv import load_dotenv
from src.db.mongodb import get_collection
import logging

load_dotenv()

OAUTH2_CLIENT_ID = os.getenv("OAUTH2_CLIENT_ID")
OAUTH2_CLIENT_SECRET = os.getenv("OAUTH2_CLIENT_SECRET")
OAUTH2_REDIRECT_URI = os.getenv("OAUTH2_REDIRECT_URI")
SECRET_KEY = os.getenv("FASTAPI_SECRET_KEY")

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Normal auth -------------------------------------------------------------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db, email: str):
    return db.find_one({"email": email})

# Google OAuth -----------------------------------------------------------------------------------------------
async def get_google_token(code: str):
    async with ClientSession() as session:
        async with session.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": OAUTH2_CLIENT_ID,
                "client_secret": OAUTH2_CLIENT_SECRET,
                "redirect_uri": OAUTH2_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        ) as response:
            return await response.json()

async def get_google_user(token: str):
    async with ClientSession() as session:
        async with session.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            params={"access_token": token},
        ) as response:
            return await response.json()