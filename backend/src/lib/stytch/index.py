from pydantic import BaseModel
from src.core.config import settings
from src.lib.logger.index import logger
import requests
import base64
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
    environment="test" if settings.fastapi_env == "dev" else "live",
)
logger.info(f"STYTCH CLIENT INITIALIZED")


class StytchConnectedAppsClient:
    def __init__(self):
        self.base_url = "https://test.stytch.com/v1/users/"
        project_id = settings.stytch_project_id
        secret = settings.stytch_secret
        credentials = f"{project_id}:{secret}".encode("utf-8")
        self.auth_header = f"Basic {base64.b64encode(credentials).decode('utf-8')}"

    def revoke_connected_app(self, user_id: str, connected_app_id: str):
        url = f"{self.base_url}{user_id}/connected_apps/{connected_app_id}/revoke"
        headers = {
            "Authorization": self.auth_header,
            "Content-Type": "application/json",
        }
        response = requests.post(url, headers=headers)
        if response.status_code != 200:
            logger.error(f"Failed to revoke connected app: {response.json()}")
            raise StytchError(response.json())
        logger.info(f"Successfully revoked connected app: {response.json()}")
        return response.json()


connected_apps_client = StytchConnectedAppsClient()
