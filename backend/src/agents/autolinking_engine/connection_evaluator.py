from pinecone import Pinecone
from src.lib.logger.index import logger
from src.core.config import settings
from src.models.index import CreateConnection

class CandidateEvaluatorAgent:
    def __new__(cls, *args, **kwargs):

        return super().__new__(cls)

    def __init__(self):
        self.stagedConnections: list[CreateConnection] = []
        logger.info("CANDIDATE EVALUATOR INITIALIZED")

    def add_connection_to_stage(self, connection: CreateConnection):
        self.stagedConnections.append(connection)

    def _reset_stage(self):
        self.stagedConnections = []
    
    def process_staged_connections(self):
        pass