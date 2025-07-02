from src.models.index import PublicMe
from src.lib.logger.index import logger
from fastapi import APIRouter
from src.routes.auth.utils import manager
from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from src.core.config import settings
from src.models.index import (
    Users,
    User,
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
from src.service.email import EmailService
from src.lib.stytch.index import (
    client as stytch_client,
    StytchError,
)

router = APIRouter()

email_service = EmailService()

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
        # Extract and validate required fields
        email = auth_request.email
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        userId = auth_request.stytchUserId
        if not userId:
            raise HTTPException(status_code=400, detail="Stytch user ID is required")

        first_name = auth_request.firstName or ""
        last_name = auth_request.lastName or ""
        profile_picture_url = auth_request.profilePictureUrl or ""

        # Find existing user
        user = Users.find_one({"email": email})
        username = generate_username() if not user else user.get("username")

        new_web_id = None

        if not user:
            # Create a new user
            create_user_data = CreateUser(
                userId=userId,
                username=username,
                email=email,
                fullName=f"{first_name} {last_name}".strip(),
                profilePictureUrl=profile_picture_url,
            )

            created_user = create_user(create_user_data)
            if not created_user:
                raise HTTPException(status_code=500, detail="Failed to create user")

            # Create welcome web for new user
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

            try:
                new_web_id = create_web(webToCreate=create_web_data, userId=userId)
                if new_web_id:
                    sourceService.create_onboarding_sources(
                        web_id=new_web_id,
                        user_id=userId,
                        background_tasks=background_tasks,
                    )
            except Exception as e:
                logger.error(f"Error creating welcome web: {str(e)}")
                # Don't fail the authentication if web creation fails
        else:
            # Use existing user's username
            username = user.get("username", generate_username())

        # Update Stytch user with external_id (only if user exists and has id)
        if user and user.get("id"):
            try:
                logger.info(f"Updating user with external_id: {user['id']}")
                stytch_client.users.update(
                    user_id=userId,
                    external_id=user["id"],
                )
            except Exception as e:
                logger.error(f"Error updating Stytch user: {str(e)}")
                # Don't fail authentication if Stytch update fails

        # Build redirect URL
        if new_web_id:
            redirect = "/auth/onboarding"
            params = f"?firstName={first_name}&lastName={last_name}&username={username}&isGoogleSignup=true&defaultWebId={new_web_id}"
        else:
            redirect = "/home"
            params = "?src=oauth"

        full_redirect_url = f"{settings.next_url}{redirect}{params}"

        return JSONResponse(content={"redirect": full_redirect_url, "success": True})

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


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
    try:
        # Validate required fields
        if not registerRequest.username:
            raise HTTPException(status_code=400, detail="Username is required")
        if not registerRequest.email:
            raise HTTPException(status_code=400, detail="Email is required")
        if not registerRequest.stytchUserId:
            raise HTTPException(status_code=400, detail="Stytch user ID is required")

        # Check for username collision
        usernameCollision = Users.find_one({"username": registerRequest.username})
        if usernameCollision:
            logger.error(f"Username already exists: {registerRequest.username}")
            raise HTTPException(
                status_code=400,
                detail="Username already exists",
            )

        # Check for email collision
        emailCollision = Users.find_one({"email": registerRequest.email})
        if emailCollision:
            logger.error(f"Email already exists: {registerRequest.email}")
            raise HTTPException(
                status_code=400,
                detail="Email already exists",
            )

        userId = registerRequest.stytchUserId

        # Create the user in mongo
        createUserPayload = CreateUser(
            userId=userId,
            username=registerRequest.username,
            email=registerRequest.email,
            fullName=registerRequest.fullName,
        )

        created_user = create_user(createUserPayload)
        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Send account creation email in the background
        background_tasks.add_task(
            email_service.account_creation,
            recipient_email=registerRequest.email,
            recipient_name=registerRequest.fullName or registerRequest.username,
        )

        # Create their default web
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

        webId = None
        try:
            webId = create_web(webToCreate=createWebPayload, userId=userId)
            if not webId:
                logger.error("create_web returned None or falsy value")
                raise HTTPException(
                    status_code=500, detail="Failed to create default web"
                )

            # Create onboarding sources in background
            sourceService.create_onboarding_sources(
                web_id=webId, user_id=userId, background_tasks=background_tasks
            )
        except Exception as e:
            logger.error(f"Error creating default web: {str(e)}")
            # If web creation fails, we should still return success for user creation
            # but log the error for investigation

        response_content = {
            "message": "Welcome to Spydr!",
            "userId": userId,
            "username": registerRequest.username,
            "email": registerRequest.email,
        }

        # Only include webId if it was successfully created
        if webId:
            response_content["webId"] = webId

        return JSONResponse(content=response_content)

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in register endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me")
def get_current_user(user: Optional[User] = Depends(manager.optional)):
    """
    Get the current user.

    :return: The current user
    """

    if not user:
        return None

    try:
        public_user = PublicMe(**user.model_dump())
        logger.debug(f"User found in /auth/me: {public_user.model_dump()}")
        return public_user.model_dump()

    except Exception as e:
        logger.error(f"Exception in /auth/me: {e}")
        return None


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
    onboarding_payload: OnboardingPayload, user: User = Depends(manager.required)
):
    logger.info(f"user: {user}")
    try:

        logger.info(f"onboarding_payload: {onboarding_payload}")
        updates = UpdateUser(
            full_name=f"{onboarding_payload.firstName} {onboarding_payload.lastName}",
            username=onboarding_payload.username,
            bio=onboarding_payload.bio,
            occupation=onboarding_payload.occupation,
            company=onboarding_payload.company,
            purpose=onboarding_payload.purpose,
            interest=onboarding_payload.interest,
        )

        logger.info(f"updates: {updates}")
        Users.update_one(
            {"id": user.id},
            {"$set": updates.model_dump(exclude_none=True)},
        )
        return {"result": True}
    except Exception as e:
        logger.error(f"Exception in /auth/me: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/authenticate/magic-link")
def authenticate_magic_link(token: str):
    """
    Authenticate a user using a magic link.
    """
    try:
        resp = stytch_client.magic_links.authenticate(token=token)
        logger.info(f"Magic link authentication response: {resp}")
        return {"result": True}
    except Exception as e:
        logger.error(f"Exception in /auth/authenticate/magic-link: {e}")
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
        resp = stytch_client.sessions.revoke(session_token=session_token)
        logger.info(f"Logout response: {resp}")
    except StytchError as e:
        raise HTTPException(status_code=400, detail=str(e))

    resp = JSONResponse(content={"message": "Successfully logged out"})
    resp.delete_cookie("stytch_session", path="/")
    resp.delete_cookie("stytch_session_jwt", path="/")
    return resp
