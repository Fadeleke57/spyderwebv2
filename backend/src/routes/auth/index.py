import uuid
import logging
from pytz import UTC
from fastapi import APIRouter
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import JSONResponse, RedirectResponse
from src.routes.auth.oauth2 import (
    get_google_token,
    get_google_user,
    manager,
    verify_password,
    get_user,
)
from src.core.config import settings
from src.models.index import (
    Webs,
    Users,
    CreateUser,
    UpdateUser,
    CreateWeb,
    create_user,
    create_web,
)
from src.utils.auth import generate_username
from src.db.neo4j import client as neo4jClient
from src.utils.credits import PLAN_CREDITS
from src.utils.exceptions import check_user
from src.lib.logger.index import logger
from pydantic import BaseModel
from typing import Optional
from fastapi import BackgroundTasks
from src.service.source import service as sourceService
from src.routes.user.index import convert_to_public_user

logging.basicConfig(level=logging.DEBUG)

OAUTH2_CLIENT_SECRET = settings.oauth2_client_secret
OAUTH2_REDIRECT_URI = settings.oauth2_redirect_uri
OAUTH2_CLIENT_ID = settings.oauth2_client_id

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

router = APIRouter()


@manager.user_loader(db_session=Users)
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
async def auth_callback(code: str, background_tasks: BackgroundTasks):
    """
    Handle the OAuth2 callback from Google.

    Takes the authorization code, exchanges it for an access token,
    retrieves user info from Google, checks if the user exists,
    and creates a user, a default web, and a source node if not.
    """
    token_data = await get_google_token(code)
    user_data, profile_picture_url = await get_google_user(token_data["access_token"])
    email = user_data["email"]
    full_name = user_data["name"]
    user = Users.find_one({"email": email})
    new_web_id = None
    if not user:
        # create a new user
        new_username = generate_username()
        create_user_data = CreateUser(
            username=new_username,
            email=email,
            full_name=full_name,
        )
        user_id = create_user(create_user_data)

        # create a new welcome web for the user
        create_web_data = CreateWeb(
            name="Welcome to Spydr!",
            description="This is your first web! Create a new web to get started.",
            visibility="Private",
            tags=[],
            sourceIds=[],
            imageKeys=[],
            enableAIConnections=False,
            showcase=False,
        )
        new_web_id = create_web(create_web_data, user_id)
        sourceService.create_onboarding_sources(new_web_id, user_id, background_tasks)

    access_token = manager.create_access_token(
        data={"sub": email}, expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response = RedirectResponse(
        url=f"""{settings.next_url}/auth/google-callback?token={access_token}&email={email}&username={new_username if not user else user['username']}&firstName={user_data.get('given_name', "")}&lastName={user_data.get('family_name', "")}&newuser={"true" if not user else ""}&newwebid={new_web_id if new_web_id else ""}""",
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

    user = Users.find_one({"email": data.username})
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
def register(create_user_data: CreateUser, background_tasks: BackgroundTasks):
    """
    Register a new user.

    This endpoint registers a new user, creates a default welcome web and
    a source node. It returns an access token for immediate login.
    """
    if Users.find_one({"email": create_user_data.email}):
        raise HTTPException(
            status_code=400, detail="There is already an account with this email."
        )
    if Users.find_one({"username": create_user_data.username}):
        raise HTTPException(
            status_code=400, detail="There is already an account with this username."
        )

    # create the user
    user_id = create_user(create_user_data)

    # create their default web
    create_web_data = CreateWeb(
        name="Welcome to Spydr!",
        description="This is your first web! Create a new web to get started.",
        visibility="Private",
        tags=[],
        sourceIds=[],
        imageKeys=[],
        enableAIConnections=False,
        showcase=True,
    )
    web_id = create_web(create_web_data, user_id)
    sourceService.create_onboarding_sources(web_id, user_id, background_tasks)

    # create access token
    access_token = manager.create_access_token(
        data={"sub": create_user_data.email},
        expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    response = JSONResponse(
        content={
            "new_web_id": web_id,
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
    check_user(user)
    try:
        if not user:
            logging.error("User not found in /auth/me")
            raise HTTPException(status_code=401, detail="Unauthorized")
        user["_id"] = str(user["_id"])
        publicUser = convert_to_public_user(
            user,
            [
                "subscription_plan",
                "websPinned",
                "websSaved",
                "websHidden",
                "created_at",
                "disabled",
            ],
        )
        logging.debug(f"User found in /auth/me: {publicUser}")
        return publicUser
    except Exception as e:
        logging.error(f"Exception in /auth/me: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


class OnboardingPayload(BaseModel):
    firstName: str
    lastName: Optional[str] = ""
    username: str
    bio: Optional[str] = ""
    occupation: str
    company: Optional[str] = ""
    purpose: str
    interest: Optional[str] = ""


@router.post("/onboarding")
def complete_onboarding(onboardingPayload: OnboardingPayload, user=Depends(manager)):
    check_user(user)
    try:
        updates = UpdateUser(
            full_name=f"{onboardingPayload.firstName} {onboardingPayload.lastName}",
            username=onboardingPayload.username,
            bio=onboardingPayload.bio,
            occupation=onboardingPayload.occupation,
            company=onboardingPayload.company,
            purpose=onboardingPayload.purpose,
            interest=onboardingPayload.interest,
        )
        logger.info(f"updates: {updates}")
        Users.update_one(
            {"id": user["id"]},
            {"$set": updates.model_dump(exclude_none=True)},
        )

        return {"result": True}
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
    check_user(user)
    manager.set_cookie(response, "")
    return {"message": "Successfully logged out"}
