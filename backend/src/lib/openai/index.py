from openai import OpenAI
from src.core.config import settings
from src.lib.logger.index import logger


class OpenAIClient:
    def __init__(self):
        logger.info("OPENAI CLIENT INITIALIZED")
        self.client = OpenAI(api_key=settings.openai_api_key)


client = OpenAIClient()
