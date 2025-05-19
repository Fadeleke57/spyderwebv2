from src.lib.logger.index import logger
from fastapi import APIRouter
from datetime import timedelta
from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from src.routes.auth.utils import (
    get_google_token,
    get_google_user,
    manager,
)
from src.core.config import settings
from src.models.index import (
    Users,
    CreateUser,
    UpdateUser,
    CreateWeb,
    create_user,
    create_web,
)
from src.utils.auth import generate_username
from src.lib.logger.index import logger
from pydantic import BaseModel
from typing import Optional
from fastapi import BackgroundTasks
from src.service.source import service as sourceService
from src.lib.stytch.index import (
    client as stytchClient,
    StytchError,
    StytchAuthenticateResponse,
    StytchUser,
    StytchCreateResponse,
)
from stytch.consumer.models.users import SearchUsersQueryOperator, SearchUsersQuery
from src.routes.user.index import convert_to_public_user

OAUTH2_CLIENT_SECRET = settings.oauth2_client_secret
OAUTH2_REDIRECT_URI = settings.oauth2_redirect_uri
OAUTH2_CLIENT_ID = settings.oauth2_client_id

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str  # better pydantic types needed
    password: str
    username: str
    fullName: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


def set_stytch_cookies(resp: JSONResponse, session_token: str, session_jwt: str):
    # session_token (opaque) and session_jwt (JWT) are both HttpOnly cookies
    cookie_params = dict(
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )
    resp.set_cookie("stytch_session_token", session_token, **cookie_params)
    resp.set_cookie("stytch_session_jwt", session_jwt, **cookie_params)


def Authenticate(session_token: str = None) -> StytchUser:
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        resp: StytchAuthenticateResponse = stytchClient.sessions.authenticate(
            session_token=session_token
        )
        return resp.user
    except StytchError:
        raise HTTPException(status_code=401, detail="Session expired or invalid")


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


@router.post("/login", status_code=200)
def login(req: LoginRequest):
    try:
        stytchResp: StytchAuthenticateResponse = (
            stytchClient.passwords.authenticate(
                email=req.email, password=req.password, session_duration_minutes=1440
            )
        )
        logger.info(f"Login response: {stytchResp}")
    except StytchError as e:
        raise HTTPException(status_code=401, detail=str(e))

    # set cookies so browser will send them on every request
    responce = JSONResponse(content={"message": "Logged in"})
    set_stytch_cookies(
        resp=responce,
        session_token=stytchResp.session_token,
        session_jwt=stytchResp.session_jwt,
    )
    return responce


@router.post("/register")
def register(registerRequest: RegisterRequest, background_tasks: BackgroundTasks):
    """
    Register a new user.

    This endpoint registers a new user, creates a default welcome web and
    a source node. It returns an access token for immediate login.
    """
    try:
        # create the user in stytch auth
        stytchResp = stytchClient.passwords.create(
            email=registerRequest.email,
            password=registerRequest.password,
            session_duration_minutes=1440,
        )
        logger.info(f"Register response: {stytchResp}")
    except StytchError as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    # create the user in mongo
    userId = stytchResp.user_id
    if Users.find_one({"email": registerRequest.email}):
        logger.error("Email already registered")
        raise HTTPException(status_code=400, detail="Email already registered")

    createUserPayload = CreateUser(
        userId=userId,
        username=registerRequest.username,
        email=registerRequest.email,
        password=registerRequest.password,
        fullName=registerRequest.fullName,
    )
    _ = create_user(createUserPayload)

    # create their default web
    createWebPayload = CreateWeb(
        name="Welcome to Spydr!",
        description="This is your first web! Create a new web to get started.",
        visibility="Private",
        tags=[],
        sourceIds=[],
        imageKeys=[],
        enableAIConnections=False,
        showcase=True,
    )

    web_id = create_web(webToCreate=createWebPayload, userId=userId)
    sourceService.create_onboarding_sources(
        web_id=web_id, user_id=userId, background_tasks=background_tasks
    )

    # set Stytch session cookies
    response = JSONResponse(
        status_code=201,
        content={"message": "Registered", "userId": userId, "webId": web_id},
    )
    set_stytch_cookies(
        resp=response,
        session_token=stytchResp.session_token,
        session_jwt=stytchResp.session_jwt,
    )
    return response


@router.get("/me")
def get_current_user(stytchUser: StytchUser = Depends(Authenticate)):
    """
    Get the current user.

    :return: The current user
    """
    try:
        user = Users.find_one({"id": stytchUser.user_id})
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
        logger.debug(f"User found in /auth/me: {publicUser}")
        return publicUser
    except Exception as e:
        logger.error(f"Exception in /auth/me: {e}")
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
def complete_onboarding(
    onboardingPayload: OnboardingPayload, stytchUser: StytchUser = Depends(Authenticate)
):
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
            {"id": stytchUser["id"]},
            {"$set": updates.model_dump(exclude_none=True)},
        )
        return {"result": True}
    except Exception as e:
        logger.error(f"Exception in /auth/me: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/logout")
def logout(request: Request):
    """
    Log out the current user.

    This endpoint clears the authentication cookie, effectively logger out the user.

    Args:
        response (Response): The response object to set the cookie.
        user (User): The user making the request, obtained from the dependency.

    Returns:
        dict: A JSON response with a message indicating successful logout.
    """
    session_token = request.cookies.get("stytch_session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        resp = stytchClient.sessions.revoke(
            session_token=session_token, session_duration_minutes=0
        )
        logger.info(f"Logout response: {resp}")
    except StytchError as e:
        raise HTTPException(status_code=400, detail=str(e))

    resp = JSONResponse(content={"message": "Successfully logged out"})
    resp.delete_cookie("stytch_session_token", path="/")
    resp.delete_cookie("stytch_session_jwt", path="/")
    return resp
