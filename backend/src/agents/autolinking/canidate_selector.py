from src.lib.openai.index import client as openaiClient
from src.lib.logger.index import logger


class CanidateSelectorAgent:  # visits the pincone database for sources within the same web (can configure to later search across other webs)
    def __init__(self):
        self.client = openaiClient


agent = CanidateSelectorAgent()
