from typing import Optional
from fastapi import HTTPException, Cookie
from src.lib.stytch.index import (
    client as stytchClient,
    StytchUser,
    StytchError,
)
from src.lib.logger.index import logger
from src.models.index import Users


def auth(
    stytch_session: Optional[str] = Cookie(None),
) -> StytchUser:
    if not stytch_session:
        logger.warning("Missing session token cookie. Received: %r", stytch_session)
        raise HTTPException(401, "Not authenticated: Missing session token cookie")
    try:
        resp = stytchClient.sessions.authenticate(session_token=stytch_session)
        logger.info("Session user: %s", resp.user.user_id)
        user = Users.find_one({"id": resp.user.external_id or resp.user.user_id})
        return user
    except StytchError as e:
        logger.warning("Stytch session authentication error: %s", e)
        raise HTTPException(401, "Session expired or invalid")


def optional_auth(
    stytch_session: Optional[str] = Cookie(None),
) -> Optional[StytchUser]:
    if not stytch_session:
        return None
    try:
        resp = stytchClient.sessions.authenticate(session_token=stytch_session)
        user = Users.find_one({"id": resp.user.external_id or resp.user.user_id})
        return user
    except StytchError as e:
        logger.warning("Optional auth failed: %s", e)
        return None


class AuthManager:
    def __init__(self):
        self.required = auth
        self.optional = optional_auth


manager = AuthManager()
