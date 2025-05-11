import logging
from fastapi import HTTPException
from src.models.index import User
from typing import Optional


def check_user(user):
    """
    Checks if a user is disabled and raises an HTTPException if they are.
    Used to check if a user is authorized to access a resource.

    Args:
        user (dict): The user document from the database.

    Raises:
        HTTPException: If the user is disabled
    """
    if not user or user["disabled"]:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")


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
