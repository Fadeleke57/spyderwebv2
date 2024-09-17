from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

env = os.getenv("ENV", "local")
load_dotenv(f".env.{env}")
print(f"Loading .env.{env}...")

class Settings(BaseSettings):
    mongo_initdb_database: str
    mongo_url: str
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    fastapi_env: str
    fastapi_secret_key: str
    oauth2_client_id: str
    oauth2_client_secret: str
    oauth2_redirect_uri: str
    next_url: str

    class Config:
        env_file = f".env.{env}"
        extra = "ignore"

settings = Settings()