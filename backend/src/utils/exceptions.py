from fastapi import HTTPException
import logging

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