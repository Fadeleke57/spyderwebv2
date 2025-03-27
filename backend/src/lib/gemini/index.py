from src.lib.logger.index import logger
import google.generativeai as genai
from src.core.config import settings


class GeminiClient:
    def __init__(self):
        logger.info("GEMINI CLIENT INITIALIZED")
        selected_model = "gemini-2.0-flash"
        genai.configure(api_key=settings.gemini_api_key)
        self.client = genai.GenerativeModel(selected_model)


client = GeminiClient()
