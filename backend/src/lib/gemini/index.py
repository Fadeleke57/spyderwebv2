from src.lib.logger.index import logger
from google import genai
from src.core.config import settings


class GeminiClient:
    def __init__(self):
        logger.info("GEMINI CLIENT INITIALIZED")
        self.selected_model = "gemini-2.0-flash"
        self.client = genai.Client(api_key=settings.gemini_api_key)


client = GeminiClient()
