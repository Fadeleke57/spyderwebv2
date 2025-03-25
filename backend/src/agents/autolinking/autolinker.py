from src.lib.openai.index import client as openaiClient
from src.lib.logger.index import logger


class AutoLinkerAgent:  # comprises of CanidateSelectorAgent and ConnectionGeneratorAgent
    def __init__(self):
        self.client = openaiClient


agent = AutoLinkerAgent()
