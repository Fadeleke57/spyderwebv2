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
    """
    Verifies a plain password against a hashed password.

    Args:
        plain_password (str): The plain password to verify.
        hashed_password (str): The hashed password to verify against.

    Returns:
        bool: True if the password is valid, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Hashes a plain password using the password hashing context.

    Args:
        password (str): The plain password to hash.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)

def get_user(db, email: str):
    """
    Retrieve a user from the database by email.

    Args:
        db: The database connection or collection to search.
        email (str): The email address of the user to retrieve.

    Returns:
        dict: The user document from the database if found, None otherwise.
    """
    return db.find_one({"email": email})

# Google OAuth -----------------------------------------------------------------------------------------------
async def get_google_token(code: str):
    """
    Retrieve an access token from Google in exchange for an authorization code.

    Args:
        code (str): The authorization code to exchange for an access token.

    Returns:
        dict: The JSON response from the Google OAuth2 token endpoint.
    """
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
    """
    Retrieve user information from Google using the access token.

    Args:
        token (str): The access token to use to retrieve user information.

    Returns:
        tuple: A tuple containing the user information as a dict and the profile picture URL as a str.
    """
    async with ClientSession() as session:
        async with session.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            params={"access_token": token},
        ) as response:
            user_info = await response.json()
            profile_picture_url = user_info.get("picture")  # Extract the profile picture URL
            return user_info, profile_picture_url