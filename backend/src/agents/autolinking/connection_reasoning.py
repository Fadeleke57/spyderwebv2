from src.lib.openai.index import client as openaiClient
from src.lib.logger.index import logger


class ConnectionReasoningAgent:  # reasons connections from selected sources
    def __init__(self):
        self.client = openaiClient


agent = ConnectionReasoningAgent()
