from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "My FastAPI Application"
    neo4j_url: str
    neo4j_user: str
    neo4j_password: str

    class Config:
        env_file = ".env"

settings = Settings()