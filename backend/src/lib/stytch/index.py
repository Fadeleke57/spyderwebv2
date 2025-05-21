from pydantic import BaseModel
from src.core.config import settings
from src.lib.logger.index import logger
from stytch import Client
from stytch.core.response_base import StytchError
from stytch.consumer.models.users import User as StytchUser
from stytch.consumer.models.sessions import Session as StytchSession
from stytch.consumer.models.passwords import (
    AuthenticateResponse as StytchAuthenticateResponse,
    CreateResponse as StytchCreateResponse,
)

client = Client(
    project_id=settings.stytch_project_id,
    secret=settings.stytch_secret,
    environment="test" if settings.fastapi_env == "dev" else "production",
)
logger.info(f"STYTCH CLIENT INITIALIZED")
