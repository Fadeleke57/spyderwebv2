from openai import OpenAI
from src.core.config import settings


class OpenAIClient:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)


client = OpenAIClient()
