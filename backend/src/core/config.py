from pydantic import BaseSettings

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