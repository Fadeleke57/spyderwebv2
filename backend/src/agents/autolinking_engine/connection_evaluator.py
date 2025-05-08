import json
from uuid import uuid4
from pytz import UTC
from datetime import datetime
from src.lib.logger.index import logger
from src.lib.gemini.index import client as geminiClient
from src.db.neo4j import client as neo4jClient
from src.models.index import CreateConnection

class ConnectionEvaluatorAgent:
    def __new__(cls, *args, **kwargs):
        """
        Creates a new instance of ConnectionEvaluatorAgent.
        This method overrides the default behavior to ensure a new instance
        is always created, preventing the use of a singleton pattern or caching.
        """
        return super().__new__(cls)

    def __init__(self, webId: str, sourceId: str):
        self.webId = webId
        self.sourceId = sourceId
        self.staged_connections: list[CreateConnection] = []
        logger.info("CONNECTION EVALUATOR INITIALIZED")

    def add_connection_to_stage(self, connection: CreateConnection):
        self.staged_connections.append(connection)

    def _reset_stage(self):
        self.staged_connections = []

    def _build_evaluation_prompt(self, k: int = 2):

        """
        Builds a prompt for the Gemini Model to evaluate the quality of the connections staged by the agent.

        Args:
            k (int): The maximum number of connections to return. Defaults to 2.

        Returns:
            str: A Gemini prompt as a string.
        """

        return f"""
        You are Charlotte, an expert connection evaluator. Given the following candidate connections,
        filter out any that are redundant or low‑value, and return the top {k} most insightful ones in JSON:

        CandidateConnections:
        {json.dumps(self.staged_connections, indent=2)}

        Returns:
            list[CreateConnection]: A list of CreateConnection objects.

        CONNECTION QUALITY HIERARCHY (from lowest to highest value):
        1. AVOID: Surface keyword matching ("both mention AI")
        2. AVOID: Topical similarity ("both discuss machine learning")
        3. MINIMAL: Direct referential links ("cites the same paper")
        4. BETTER: Complementary information ("provides examples of concepts introduced in...")
        5. VALUABLE: Sequential development ("builds upon the framework by adding...")
        6. EXCELLENT: Conceptual bridges ("connects theoretical principles from X with practical applications in Y")
        7. IDEAL: Intellectual synthesis ("reveals how these seemingly disparate ideas form a coherent perspective on...")

        Constraints:
        - If less than or equal to {k} connections are given, return them all.
        - At most {k} connections.
        - Rank based on the quality of each connection and return the best {k}.
        - Output valid JSON list.
        """

    def process_staged_connections(self) -> None:
        if not self.staged_connections:
            logger.info("No connections to evaluate.")
            return

        prompt = self._build_evaluation_prompt()
        try:
            # ask Gemini to rank & filter
            response = geminiClient.client.models.generate_content(
                model=geminiClient.selected_model,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": list[CreateConnection],
                },
            )
            filtered = json.loads(response.text)
        except Exception as e:
            logger.error(f"Error during evaluation: {e}")
            filtered = []

        # enrich & write top‑k to Neo4j
        created = 0
        for entry in filtered:
            entry["connectionId"] = str(uuid4())
            entry["webId"] = self.webId
            entry["fromSourceId"] = self.sourceId
            entry["created"] = datetime.now(UTC)
            entry["updated"] = datetime.now(UTC)
            entry["aiGenerated"] = True

            try:
                neo4jClient.create_connection_between_sources(
                    start_node_id=self.sourceId,
                    end_node_id=entry["toSourceId"],
                    properties=entry,
                )
                created += 1
            except Exception as e:
                logger.error(f"Failed to write connection {entry}: {e}")

        logger.info(f"Evaluator wrote {created} connections.")
        # clear stage for next run
        self.staged_connections = []