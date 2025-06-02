from src.lib.logger.index import logger
from fastapi import APIRouter
from src.routes.auth.utils import manager
from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
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
)
from src.routes.user.index import convert_to_public_user

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str  # better pydantic types needed
    password: str
    username: str
    fullName: Optional[str] = None
    stytchUserId: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class CompleteAuthenticationRequest(BaseModel):
    stytchUserId: str
    email: str
    firstName: str
    lastName: str
    profilePictureUrl: str


@router.post("/authenticate")
def authenticate(
    auth_request: CompleteAuthenticationRequest,
    background_tasks: BackgroundTasks,
):

    try:
        email = auth_request.email
        user = Users.find_one({"email": email})
        userId = auth_request.stytchUserId
        first_name = auth_request.firstName
        last_name = auth_request.lastName
        profile_picture_url = auth_request.profilePictureUrl
        username = generate_username() if not user else user["username"]

        new_web_id = None
        if not user:
            # create a new user
            create_user_data = CreateUser(
                userId=userId,
                username=username,
                email=email,
                fullName=f"{first_name} {last_name}",
                profilePictureUrl=profile_picture_url,
            )

            _ = create_user(create_user_data)

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

            try:
                new_web_id = create_web(webToCreate=create_web_data, userId=userId)
                sourceService.create_onboarding_sources(
                    web_id=new_web_id, user_id=userId, background_tasks=background_tasks
                )
            except Exception as e:
                logger.error(f"Error creating welcome web: {str(e)}")

        else:
            username = user["username"]

        logger.info(f"Updating user with external_id: {user['id']}")
        stytchClient.users.update(
            user_id=userId,
            external_id=user["id"],
        )

        redirect = "/auth/onboarding" if new_web_id else "/home"
        params = (
            f"?firstName={first_name}&lastName={last_name}&username=${username}&isGoogleSignup=true&defaultWebId={new_web_id}"
            if new_web_id
            else "?src=oauth"
        )

        full_redirect_url = f"{settings.next_url}{redirect}{params}"

        return JSONResponse(content={"redirect": full_redirect_url, "success": True})

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Exception in /auth/authenticate: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/register")
def register(registerRequest: RegisterRequest, background_tasks: BackgroundTasks):
    """
    Register a new user in the system.

    This endpoint creates a new user in both Stytch and the local MongoDB database,
    and creates their default web.

    Args:
        registerRequest: The request payload containing the user's information.
        background_tasks: The background tasks to run after the user is registered.

    Returns:
        A JSONResponse with the user's id and web id.

    Raises:
        HTTPException: If the user could not be registered.
    """

    usernameCollision = Users.find_one({"username": registerRequest.username})
    if usernameCollision:
        logger.error(f"username already exists: {registerRequest.username}")
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    # create the user in mongo
    userId = registerRequest.stytchUserId

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

    try:
        webId = create_web(webToCreate=createWebPayload, userId=userId)
        sourceService.create_onboarding_sources(
            web_id=webId, user_id=userId, background_tasks=background_tasks
        )
    except Exception as e:
        logger.error(f"Exception in /auth/register: {e}")
        raise HTTPException(status_code=500, detail="Error creating default web")

    response = JSONResponse(
        content={
            "message": "Welcome to Spydr!",
            "userId": userId,
            "webId": webId,
            "username": registerRequest.username,
            "email": registerRequest.email,
        },
    )
    return response


@router.get("/me")
def get_current_user(user=Depends(manager.required)):
    """
    Get the current user.

    :return: The current user
    """
    try:
        if not user:
            return None
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
    onboardingPayload: OnboardingPayload, user=Depends(manager.required)
):
    logger.info(f"user: {user}")
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
    session_token = request.cookies.get("stytch_session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        resp = stytchClient.sessions.revoke(session_token=session_token)
        logger.info(f"Logout response: {resp}")
    except StytchError as e:
        raise HTTPException(status_code=400, detail=str(e))

    resp = JSONResponse(content={"message": "Successfully logged out"})
    resp.delete_cookie("stytch_session", path="/")
    resp.delete_cookie("stytch_session_jwt", path="/")
    return resp
