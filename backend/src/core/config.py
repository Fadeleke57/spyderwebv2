from pydantic import BaseSettings
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    mongo_url: str
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    fastapi_env: str
    fastapi_secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()