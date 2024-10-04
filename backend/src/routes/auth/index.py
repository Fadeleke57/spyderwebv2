from fastapi import Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import JSONResponse, RedirectResponse
from src.routes.auth.oauth2 import get_google_token, get_google_user, manager, get_password_hash, verify_password, get_user
from src.core.config import settings
from src.models.user import User
from src.db.mongodb import get_collection
from datetime import timedelta
import logging
from fastapi import APIRouter
import uuid

logging.basicConfig(level=logging.DEBUG)

OAUTH2_CLIENT_SECRET = settings.oauth2_client_secret
OAUTH2_REDIRECT_URI = settings.oauth2_redirect_uri
OAUTH2_CLIENT_ID = settings.oauth2_client_id

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

router = APIRouter()

@manager.user_loader(db_session=get_collection('users'))
def load_user(email: str, db_session):
    logging.debug(f"Registering user_loader callback with email: {email}")
    user = get_user(db_session, email)
    if user:
        logging.debug(f"User loaded successfully: {user}")
    else:
        logging.debug("No user found.")
    return user

@router.get("/login/google")
def login():
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        "?response_type=code"
        f"&client_id={OAUTH2_CLIENT_ID}"
        f"&redirect_uri={OAUTH2_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(google_auth_url)

@router.get("/callback")
async def auth_callback(code: str):
    token_data = await get_google_token(code)
    user_data, profile_picture_url = await get_google_user(token_data["access_token"])
    email = user_data["email"]
    
    collection = get_collection('users')
    user = collection.find_one({"email": email})
    
    if not user:
        collection.insert_one({
            "id": str(uuid.uuid4()),
            "username": user_data["name"],
            "full_name": user_data["name"],
            "email": user_data["email"],
            "hashed_password": None,  # no password for google registrations
            "disabled": False,
            "profile_picture_url": profile_picture_url,
            "analytics": { "searches": [] }
        })
    
    access_token = manager.create_access_token(
        data={"sub": email},
        expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response = RedirectResponse(url=f"{settings.next_url}/auth/google-callback?token={access_token}&email={email}&name={user_data['name']}")
    manager.set_cookie(response, access_token)
    return response

@router.post('/token')
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

@router.post('/register')
def register(user: User):
    collection = get_collection('users')
    if collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_data = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "full_name": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "disabled": False,
        "profile_picture_url": None,
        "analytics": {"searches": []}
    }
    collection.insert_one(user_data)
    return {"msg": "User registered successfully"}

@router.get("/me")
def get_current_user(user=Depends(manager)):
    try:
        if not user:
            logging.error("User not found in /auth/me")
            raise HTTPException(status_code=401, detail="Unauthorized")
        user["_id"] = str(user["_id"])
        logging.debug(f"User found in /auth/me: {user}")
        return user
    except Exception as e:
        logging.error(f"Exception in /auth/me: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.post("/logout")
async def logout(response: Response, user=Depends(manager)):
    manager.set_cookie(response, "")
    return {"message": "Successfully logged out"}