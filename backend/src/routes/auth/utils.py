from typing import Optional, Union
from fastapi import HTTPException, Cookie, Header, Depends
from src.lib.stytch.index import (
    client as stytchClient,
    StytchError,
)
from src.lib.logger.index import logger
from src.models.index import Users, User


async def get_current_user_from_token(
    authorization: Optional[str] = Header(
        None, description="Bearer token for authentication"
    ),
    stytch_session_jwt: Optional[str] = Cookie(
        None, description="Stytch session JWT from cookie"
    ),
) -> User:

    token_to_validate: Optional[str] = None
    auth_method_details: str = ""

    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token_to_validate = parts[1]
            auth_method_details = "Bearer token"
        else:
            logger.warning(
                f"Invalid Authorization header format. Received: {authorization}"
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid Authorization header format. Expected 'Bearer <token>'.",
            )
    elif stytch_session_jwt:
        token_to_validate = stytch_session_jwt
        auth_method_details = "Cookie (stytch_session_jwt)"

    if not token_to_validate:
        logger.warning(
            "Missing authentication token (neither Bearer token nor cookie found)."
        )
        raise HTTPException(status_code=401, detail="Not authenticated: Missing token")

    try:
        resp = stytchClient.sessions.authenticate(session_jwt=token_to_validate)

        logger.info(
            f"Successfully authenticated user_id: {resp.user.user_id} via {auth_method_details}"
        )

        user = Users.find_one({"id": resp.user.external_id or resp.user.user_id})
        if not user:
            logger.warning(
                f"Authenticated user {resp.user.user_id} not found in local database."
            )
            raise HTTPException(
                status_code=401,
                detail="User not found in local system after authentication",
            )
        return user

    except StytchError as e:
        logger.warning(f"Stytch authentication error with {auth_method_details}: {e}")
        raise HTTPException(
            status_code=401, detail=f"Authentication failed: {e.message}"
        )
    except Exception as e:
        logger.error(
            f"Unexpected error during authentication with {auth_method_details}: {e}"
        )
        raise HTTPException(
            status_code=500, detail="Internal server error during authentication"
        )


class AuthManager:
    def __init__(self):
        self.required = get_current_user_from_token

        async def optional_user_from_token(
            authorization: Optional[str] = Header(None),
            stytch_session_jwt: Optional[str] = Cookie(None),
        ) -> Optional[User]:
            try:
                return await get_current_user_from_token(
                    authorization=authorization,
                    stytch_session_jwt=stytch_session_jwt,
                )
            except HTTPException as http_exc:
                if http_exc.status_code == 401:
                    logger.info(f"Optional authentication failed: {http_exc.detail}")
                    return None
                raise
            except Exception as e:
                logger.error(f"Unexpected error during optional authentication: {e}")
                return None

        self.optional = optional_user_from_token


manager = AuthManager()
