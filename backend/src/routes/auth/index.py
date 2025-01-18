from fastapi import Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import JSONResponse, RedirectResponse
from src.routes.auth.oauth2 import (
    get_google_token,
    get_google_user,
    manager,
    get_password_hash,
    verify_password,
    get_user,
)
from src.core.config import settings
from src.models.user import User, CreateUser
from src.db.mongodb import get_collection
from datetime import timedelta
import logging
from fastapi import APIRouter
import uuid
from datetime import datetime
from pytz import UTC
from src.utils.auth import generate_username

logging.basicConfig(level=logging.DEBUG)

OAUTH2_CLIENT_SECRET = settings.oauth2_client_secret
OAUTH2_REDIRECT_URI = settings.oauth2_redirect_uri
OAUTH2_CLIENT_ID = settings.oauth2_client_id

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

router = APIRouter()


@manager.user_loader(db_session=get_collection("users"))
def load_user(email: str, db_session):
    """
    User loader callback for FastAPI-Login.

    FastAPI-Login will use this function to load a user given an email.
    The function should return None if the user does not exist.

    :param email: The email address of the user
    :param db_session: The database session
    :return: A User object if the user is found, None otherwise
    """
    logging.debug(f"Registering user_loader callback with email: {email}")
    user = get_user(db_session, email)
    if user:
        logging.debug(f"User loaded successfully: {user}")
    else:
        logging.debug("No user found.")
    return user


@router.get("/login/google")
def login():
    """
    Redirect the user to Google's OAuth2 authorization page.

    This endpoint is used to start the OAuth2 flow with Google. The user will be redirected to Google's authorization page, where they can grant access to their Google account.

    :return: A RedirectResponse to Google's OAuth2 authorization page
    """
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
    """
    Handle the OAuth2 callback from Google.

    This endpoint is used to handle the OAuth2 callback from Google. It will take the authorization code from the query parameter and exchange it for an access token. The access token will then be used to load the user from the database, and if the user does not exist, create a new one. The user will be redirected to the Next.js app with an access token in the query parameter.

    :param code: The authorization code from Google
    :return: A RedirectResponse to the Next.js app with an access token in the query parameter
    """
    token_data = await get_google_token(code)
    user_data, profile_picture_url = await get_google_user(token_data["access_token"])
    email = user_data["email"]

    Users = get_collection("users")
    Buckets = get_collection("buckets")
    user = Users.find_one({"email": email})

    if not user:
        Users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "username": generate_username(),
                "full_name": user_data["name"],
                "email": user_data["email"],
                "hashed_password": None,  # no password for google registrations
                "disabled": False,
                "profile_picture_url": profile_picture_url,
                "analytics": {"searches": []},
                "created": datetime.now(UTC),
                "updated": datetime.now(UTC),
                "bucketsHidden": [],
                "bucketsSaved": [],
            }
        )
        Buckets.insert_one(
            {
                "bucketId": str(uuid.uuid4()),
                "name": "Welcome to Spydr!",
                "description": "This is your first bucket! Create a new bucket to get started.",
                "userId": Users.find_one({"email": email})["id"],
                "articleIds": [],
                "created": datetime.now(),
                "updated": datetime.now(),
                "visibility": "Private",
                "tags": [],
                "likes": [],
                "iterations": [],
            }
        )
        user = Users.find_one({"email": email})

    access_token = manager.create_access_token(
        data={"sub": email}, expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response = RedirectResponse(
        url=f"{settings.next_url}/auth/google-callback?token={access_token}&email={email}&name={user_data['name']}"
    )
    manager.set_cookie(response, access_token)
    return response


@router.post("/token")  # normal auth
def login(data: OAuth2PasswordRequestForm = Depends()):
    """
    Generate an access token for a user.

    This endpoint is used to generate an access token for a user. It will take the username and password from the request body and verify them against the database. If the credentials are valid, an access token will be generated and returned in the response body. The access token will be set in a cookie in the response.

    :param data: The username and password to verify
    :return: A JSONResponse with an access token in the response body
    """
    collection = get_collection("users")
    user = collection.find_one({"email": data.username})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise InvalidCredentialsException
    access_token = manager.create_access_token(
        data={"sub": data.username},
        expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    response = JSONResponse(content={"access_token": access_token}, status_code=200)
    manager.set_cookie(response, access_token)
    return response


@router.post("/register")
def register(user: CreateUser):
    """
    Register a new user.

    This endpoint is used to register a new user. It takes a `CreateUser` object in the request body and verifies the email and password. If the email is not already registered, a new user is created and a new bucket is created for the user. The user is then returned in the response body.

    :param user: The user to register
    :return: A JSONResponse with a success message
    """
    Users = get_collection("users")

    if Users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=400, detail="There is already an account with this email."
        )
    if Users.find_one({"username": user.username}):
        raise HTTPException(
            status_code=400, detail="There is already an account with this username."
        )

    hashed_password = get_password_hash(user.password)
    userId = str(uuid.uuid4())
    user_data = {
        "id": userId,
        "username": user.username,
        "full_name": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "disabled": False,
        "profile_picture_url": None,
        "analytics": {"searches": []},
        "created": datetime.now(UTC),
        "updated": datetime.now(UTC),
        "bucketsHidden": [],
        "bucketsSaved": [],
    }
    Users.insert_one(user_data)

    Buckets = get_collection("buckets")
    bucketId = str(uuid.uuid4())
    Buckets.insert_one(
        {
            "bucketId": bucketId,
            "name": "Welcome to Spydr!",
            "description": "This is your first bucket! Create a new bucket to get started.",
            "userId": userId,
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
            "visibility": "Private",
            "tags": [],
            "likes": [],
            "iterations": [],
        }
    )

    sourceId = str(uuid.uuid4())
    Sources = get_collection("sources")
    Sources.insert_one(
        {
            "sourceId": sourceId,
            "bucketId": bucketId,
            "userId": userId,
            "name": "How to use Spydr (click me!)",
            "content": "## Spydr is a social platform that allows you to create, manage, and share your own internet knowledge bases.\n ### To get started\n1. Create a new bucket or edit this one and add your first source.\n2. You can then add notes, articles, and other content to your bucket.\n3. Click on entities to view/edit their content.\n4. Once you are done, you can share your bucket with others or leave it private to control who can access it.\n5. Outside of your knowledge base, you can also hop into other buckets and start from there.\n### Have fun!",
            "url": None,
            "type": "note",
            "size": None,
            "created": datetime.now(UTC),
            "updated": datetime.now(UTC),
        }
    )

    Buckets.update_one(
        {"bucketId": bucketId, "userId": userId},
        {"$push": {"sourceIds": sourceId}, "$set": {"updated": datetime.now(UTC)}},
    )

    access_token = manager.create_access_token(
        data={"sub": user.email}, expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    response = JSONResponse(
        content={
            "msg": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
        },
        status_code=201,
    )
    manager.set_cookie(response, access_token)
    return response


@router.get("/me")
def get_current_user(user=Depends(manager)):
    """
    Get the current user.

    :return: The current user
    """

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
    """
    Log out the current user.

    This endpoint clears the authentication cookie, effectively logging out the user.

    Args:
        response (Response): The response object to set the cookie.
        user (User): The user making the request, obtained from the dependency.

    Returns:
        dict: A JSON response with a message indicating successful logout.
    """
    manager.set_cookie(response, "")
    return {"message": "Successfully logged out"}
