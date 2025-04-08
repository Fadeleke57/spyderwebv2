import json
from uuid import uuid4
from pytz import UTC
from datetime import datetime
from src.lib.logger.index import logger
from src.lib.gemini.index import client as geminiClient
from src.models.index import CreateConnection
from src.db.neo4j import client as neo4jClient


class ConnectionReasoningAgent:  # reasons connections from selected sources and generates structured output
    def __new__(cls, *args, **kwargs):
        """
        Creates a new instance of ConnectionReasoningAgent.
        This method overrides the default behavior to ensure a new instance
        is always created, preventing the use of a singleton pattern or caching.
        """
        return super().__new__(cls)

    def __init__(self, webId: str, sourceId: str):
        """
        Initializes a new instance of the ConnectionReasoningAgent.

        Args:
            webId (str): The identifier for the web context in which connections are being reasoned.
            sourceId (str): The identifier for the source from which connections are being reasoned.

        Raises:
            ValueError: If either webId or sourceId is not provided.

        Sets up:
            - Initializes webId and sourceId attributes.
            - Prepares an empty list to stage connections.
            - Logs the initialization of the connection reasoning agent.
        """
        if not webId or not sourceId:
            raise ValueError("Information is missing: webId or sourceId")

        self.webId = webId
        self.sourceId = sourceId
        self.staged_connections: list[CreateConnection] = []
        logger.info("CONNECTION REASONING AGENT INITIALIZED")

    def _create_connections_list(self, candidate_document):
        """
        Generates a list of CreateConnection objects from the candidate document using the Gemini Model.

        Args:
            candidate_document (dict): The candidate document containing the source and its candidates.

        Returns:
            list[CreateConnection]: A list of CreateConnection objects.

        Raises:
            RuntimeError: If there is an error generating content from the Gemini Model.
        """
        logger.info(f"Creating connections...")
        try:
            response = geminiClient.client.models.generate_content(
                model=geminiClient.selected_model,
                contents=self._generate_prompt(candidate_document),
                config={
                    "response_mime_type": "application/json",
                    "response_schema": list[CreateConnection],
                },
            )
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            raise RuntimeError(f"Error generating content: {e}")

        try:

            parsed_response = json.loads(response.text)
            logger.info(f"Parsed response: {parsed_response}")

            if not isinstance(parsed_response, list):
                logger.error(f"Error parsing response: {e}")
                return []
            else:
                self.staged_connections.extend(parsed_response)
                return parsed_response

        except Exception as e:
            logger.error(f"Error parsing response: {e}")
            # Log the raw response for debugging
            logger.error(f"Raw response: {response}")
            return []

    def create_relationships_in_db(
        self, candidate_document
    ):  # use neo4j to take structured output and create relationships
        """
        Uses the structured output from the Gemini Model to create relationships in the database.

        Args:
            candidate_document (dict): The candidate document containing the source and its candidates.

        Returns:
            bool: True if all relationships were created successfully, False otherwise.

        Raises:
            RuntimeError: If there is an error generating content from the Gemini Model.
        """
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
                s = neo4jClient.create_connection_between_sources(
                    start_node_id=self.sourceId,
                    end_node_id=connection["toSourceId"],
                    properties=connection,
                )
                if s:
                    num_created += 1
                else:
                    num_errors += 1
            except Exception as e:
                num_errors += 1
                logger.error(f"Error creating relationship: {e}. Skipping...")
                continue

        logger.info(f"Created {num_created} connections with {num_errors} errors")
        return True

    def _generate_prompt(self, candidate_document):
        """
        Generates the prompt to send to the Gemini Model. This prompt is the input to the model, and it defines the task of generating meaningful connections between a new document chunk and a set of existing document chunks in a user's knowledge base.

        The generated prompt includes the following information:
        - A description of the task
        - The input context: candidate document metadata, previously selected candidate documents, webId, previously established connections, fromSourceId, and the 'score' field
        - Connection reasoning objectives: identify meaningful connections, generate natural descriptions, ensure connections add value, identify unique connections, and reference specific locations
        - Guidelines: leverage metadata, avoid redundancy, focus on meaningful relationships, and emphasize natural language
        - Connection generation criteria: generate 1-3 unique connections, each with a clear relationship explanation, validated source and destination document IDs, and the webId
        - Important constraints: only generate connections with high confidence and clear rationale, avoid redundant or trivial connections, and do not refer to identifiers or documents as "the candidate document", etc.
        - Output format requirements: structured JSON matching the CreateConnection model, detailed connection descriptions, and ensure programmatic parseability

        The generated prompt is a string that is sent to the Gemini Model to generate connections. It is the single input to the model.

        Returns:
            str: The generated prompt
        """
        GEMINI_CONNECTION_REASONING_PROMPT = f"""You are an expert knowledge graph connection reasoning agent. Your task is to evaluate and establish meaningful, non-trivial connections between a new document chunk and a set of existing document chunks in a user's knowledge base.

        Input Context:
        - Candidate Document Metadata: {candidate_document["model_candidate"]}
        - Previously Selected Candidate Documents: {candidate_document["candidates_to_link"]}
        - webId will always be: {self.webId}
        - **Previously Established Connections:** {self.staged_connections}
        - fromSourceId will always be: {self.sourceId}
        - The 'score' field is the similarity score between the candidate document and the selected source document
        - Documents are sourced from things such as youtube video transcripts, a user's notes, pdf files, etc

        Connection Reasoning Objectives:
        1. Identify meaningful, non-trivial connections between documents
        2. **Generate Natural Descriptions:** Craft descriptions that read as if a human identified the connection, avoiding technical jargon.
        3. Ensure connections add value to the overall knowledge graph
        4. **Identify Unique Connections:** Ensure each connection is distinct from previously established ones.
        5. **Reference Specific Locations:** Utilize metadata to specify the exact location within the parent document, such as page numbers, section titles, or timestamps (for youtube videos, convert seconds to HH:MM:SS).

        Guidelines:
        - **Leverage Metadata:** Use available metadata to refer to document chunks naturally. For example, instead of saying "the source document chunk," use the section title or page number.
        - **Avoid Redundancy:** Cross-reference with the list of previously established connections to prevent duplicates.
        - **Focus on Meaningful Relationships:** Prioritize connections that provide insightful or valuable links between document chunks.
        - **Emphasize Natural Language:** Describe connections in a way that is clear and sound, as if a human wrote them.

        Connection Generation Criteria:
        - Generate 1-3 unique connections
        - Each connection must have:
        a) A clear, descriptive relationship explanation (i.e, "Extends theoretical framework proposed in...", "Alexandr Smith offers a new approach to this method...")
        b) Validated source and destination document IDs
        c) The webId given

        Important Constraints:
        - Only generate connections with high confidence and clear rationale
        - Avoid redundant or trivial connections
        - If no meaningful connections exist, return an empty list. DO NOT FORCE IT.
        - DO NOT refer to any identifiers or to documents as "the candidate document", "the model document", etc. 
        - Use the context of the metadata to make the description sound natural, as if a human wrote it, i.e "Mentions this concept in the context of his podcast..." 

        Output Format Requirements:
        - Structured JSON matching the CreateConnection model
        - Include detailed connection descriptions
        - Ensure programmatic parseability

        Example Connection Description Styles:
        Example Connection Descriptions:
        - "In the 'Introduction' section (page 2) of 'Understanding AI,' the author discusses concepts that are further elaborated in the 'Deep Learning' section (page 10) of 'Advanced AI Techniques.'"
        - "The segment from 00:15:30 to 00:17:45 in 'Lecture on AI Ethics' addresses issues that are also covered in the 'Bias in AI' section of 'AI Fairness Guidelines.'"

        Reasoning Process:
        1. Deeply analyze the semantic content of all documents
        2. Map potential relationship vectors
        3. Evaluate connection significance
        4. Generate structured connection output

        Generate your connections now."""

        return GEMINI_CONNECTION_REASONING_PROMPT
