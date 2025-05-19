from pydantic_settings import BaseSettings
from src.lib.logger.index import logger
import os
from dotenv import load_dotenv

load_dotenv(f".env")
logger.info(f"LOADING ENVIRONMENT: {os.getenv('FASTAPI_ENV')}")


class Settings(BaseSettings):
    mongo_initdb_database: str
    mongo_url: str
    neo4j_uri: str
    neo4j_username: str
    neo4j_password: str
    fastapi_env: str
    fastapi_secret_key: str
    fastapi_api_url: str
    oauth2_client_id: str
    oauth2_client_secret: str
    oauth2_redirect_uri: str
    next_url: str
    pinecone_api_key: str
    pinecone_index_name: str
    openai_api_key: str
    gemini_api_key: str
    s3_bucket_name: str
    cloudfront_domain: str
    youtube_api_key: str
    firecrawl_api_key: str
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    stripe_basic_monthly_price_id: str
    stripe_basic_yearly_price_id: str
    stripe_pro_monthly_price_id: str
    stripe_pro_yearly_price_id: str
    proxy_username: str
    proxy_password: str
    stytch_project_id: str
    stytch_secret: str

    class Config:
        env_file = f".env"
        extra = "ignore"


settings = Settings()
