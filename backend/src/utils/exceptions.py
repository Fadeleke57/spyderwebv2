from fastapi import HTTPException
import logging

def check_user(user):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")