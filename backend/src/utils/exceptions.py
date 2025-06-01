import logging
from fastapi import HTTPException
from src.models.index import User
from typing import Optional


def checkAuthorizedUser(
    resourceUserId: str, userMakingRequest: Optional[dict] = None, denyRequest=False
):
    if denyRequest:
        if not userMakingRequest or userMakingRequest["id"] != resourceUserId:
            logging.error("Not authorized!")
            raise HTTPException(status_code=401, detail="Unauthorized")
    else:
        if not userMakingRequest:
            return False
        else:
            return userMakingRequest.get("id", None) == resourceUserId
