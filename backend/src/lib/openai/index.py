from openai import OpenAI
from src.core.config import settings

CLIENT = OpenAI(api_key=settings.openai_api_key)
