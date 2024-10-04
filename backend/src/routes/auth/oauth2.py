import os
from fastapi.security import OAuth2PasswordBearer
from fastapi_login import LoginManager
from passlib.context import CryptContext
from aiohttp import ClientSession
from src.core.config import settings

OAUTH2_CLIENT_ID = settings.oauth2_client_id
OAUTH2_CLIENT_SECRET = settings.oauth2_client_secret
OAUTH2_REDIRECT_URI = settings.oauth2_redirect_uri
SECRET_KEY = settings.fastapi_secret_key

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

manager = LoginManager(SECRET_KEY, token_url='/auth/token', use_cookie=True)
manager.cookie_name = "access_token"

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
            user_info = await response.json()
            profile_picture_url = user_info.get("picture")  # Extract the profile picture URL
            return user_info, profile_picture_url