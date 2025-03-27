from src.lib.gemini.index import client as geminiClient
from src.lib.logger.index import logger
from src.models.connection import CreateConnection, Connections
from src.db.neo4j import client as neo4jClient
from datetime import datetime
from uuid import uuid4
from pytz import UTC
import json

class ConnectionReasoningAgent:  # reasons connections from selected sources and generates structured output
    def __init__(self, webId: str, sourceId: str):
        if not webId or not sourceId:
            raise ValueError("Information is missing: webId or sourceId")

        self.webId = webId
        self.sourceId = sourceId
        logger.info("CONNECTION REASONING AGENT INITIALIZED")

    def _create_connections_list(
        self, candidate_document
    ):
        logger.info(f"Creating connections...")
        try:
            response = geminiClient.client.generate_content(
                contents=self._generate_prompt(candidate_document),
                generation_config={
                    "response_mime_type": "application/json",
                    "response_schema": list[CreateConnection],
                },
            )
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            raise RuntimeError(f"Error generating content: {e}")

        try:

            # Attempt to parse directly if above methods fail
            parsed_response = json.loads(response.text)
            logger.info(f"Parsed response: {parsed_response}")
            # Validate and convert to list of dicts if needed
            if not isinstance(parsed_response, list):
                raise ValueError("Response is not a list")

            return parsed_response

        except Exception as e:
            logger.error(f"Error parsing response: {e}")
            # Log the raw response for debugging
            logger.error(f"Raw response: {response}")
            raise RuntimeError(f"Error parsing response: {e}")

    def create_relationships_in_db(
        self, candidate_document
    ):  # use neo4j to take structured output and create relationships
        logger.info(f"Creating relationships...")
        connections: list[CreateConnection] = self._create_connections_list(
            candidate_document
        )
        for c in connections:
            c["connectionId"] = str(uuid4())
            c["webId"] = self.webId
            c["fromSourceId"] = self.sourceId
            c["created"] = datetime.now(UTC)
            c["updated"] = datetime.now(UTC)
            c["aiGenerated"] = True

        num_created = 0
        num_errors = 0

        for connection in connections:
            try:
                neo4jClient.create_connection_between_sources(
                    start_node_id=self.sourceId,
                    end_node_id=connection["toSourceId"],
                    properties=connection,
                )
                num_created += 1
            except Exception as e:
                num_errors += 1
                logger.error(f"Error creating relationship: {e}. Skipping...")
                continue

        logger.info(f"Created {num_created} connections with {num_errors} errors")
        return True

    def _generate_prompt(self, candidate_document):

        GEMINI_CONNECTION_REASONING_PROMPT = f"""You are an expert knowledge graph connection reasoning agent. Your task is to systematically evaluate the semantic relationships between a candidate document and a set of previously selected source documents.

        Input Context:
        - Candidate Document Metadata: {candidate_document["model_candidate"]}
        - Previously Selected Candidate Documents: {candidate_document["candidates_to_link"]}
        - webId will always be: {self.webId}
        - fromSourceId will always be: {self.sourceId}
        - The 'score' field is the similarity score between the candidate document and the selected source document
        - Documents are sourced from things such as youtube video transcripts, a user's notes, pdf files, etc

        Connection Reasoning Objectives:
        1. Identify meaningful, non-trivial connections between documents
        2. Generate precise, informative connection descriptions
        3. Ensure connections add value to the overall knowledge graph

        Reasoning Guidelines:
        - Look beyond surface-level textual similarities
        - Consider conceptual, causal, and contextual relationships
        - Prioritize connections that reveal deeper insights or novel understandings

        Connection Generation Criteria:
        - Generate 2-5 unique connections
        - Each connection must have:
        a) A clear, descriptive relationship explanation (i.e, "Extends theoretical framework proposed in...", "Alexandr Smith offers a new approach to this method...")
        b) Validated source and destination document IDs
        c) The webId given

        Important Constraints:
        - Only generate connections with high confidence and clear rationale
        - Avoid redundant or trivial connections
        - If no meaningful connections exist, return an empty list
        - DO NOT refer to any identifiers or to documents as "the candidate document", "the model document", etc. 
        - Use the context of the metadata to make the description sound natural, as if a human wrote it, i.e "Mentions this concept in the context of his podcast..." 

        Output Format Requirements:
        - Structured JSON matching the CreateConnection model
        - Include detailed connection descriptions
        - Ensure programmatic parseability

        Example Connection Description Styles:
        - "Extends theoretical framework proposed in..."
        - "Provides empirical evidence contradicting..."
        - "Offers complementary methodological approach to..."

        Reasoning Process:
        1. Deeply analyze the semantic content of all documents
        2. Map potential relationship vectors
        3. Evaluate connection significance
        4. Generate structured connection output

        Generate your connections now, focusing on depth, precision, and scholarly rigor."""

        return GEMINI_CONNECTION_REASONING_PROMPT
