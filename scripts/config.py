from pydantic_settings import BaseSettings
from dotenv import load_dotenv

selected_env = "local" # Toggle here "local" or "prod"

load_dotenv(f".env.{selected_env}")
print(f"Loading .env.{selected_env}")


class Settings(BaseSettings):
    mongo_initdb_root_username: str
    mongo_initdb_root_password: str
    mongo_initdb_root_database: str
    mongo_url: str

    neo4j_uri: str
    neo4j_username: str
    neo4j_password: str

    pinecone_api_key: str
    pinecone_index_name: str

    class Config:
        env_file = f".env.{selected_env}"
        extra = "ignore"


settings = Settings()
