from typing import Optional
from fastapi import HTTPException, Cookie
from src.lib.stytch.index import client as stytchClient, StytchAuthenticateResponse, StytchUser, StytchError
from src.lib.logger.index import logger

def manager(
    stytch_session_token: Optional[str] = Cookie(None),
) -> StytchUser:
    if not stytch_session_token:
        logger.warning(f"Missing session token cookie. Recieved: {stytch_session_token}")
        raise HTTPException(
            status_code=401, detail="Not authenticated: Missing session token cookie"
        )
    try:
        resp = stytchClient.sessions.authenticate(
            session_token=stytch_session_token
        )
        logger.info(f"Session user: {resp.user.name.first_name} {resp.user.name.last_name}")
        return resp.user
    except StytchError as e:
        logger.warning(
            f"Stytch session authentication error: {str(e)}"
        )
        raise HTTPException(status_code=401, detail="Session expired or invalid")