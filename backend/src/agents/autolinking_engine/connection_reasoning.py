import json
import time
from src.lib.logger.index import logger
from src.lib.gemini.index import client as geminiClient
from src.models.index import CreateConnection

# shared rate limiter timestamp
_last_gemini_call = 0
GEMINI_MIN_INTERVAL = 5

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

    def _rate_limited_generate(self, prompt):
        global _last_gemini_call

        now = time.time()
        elapsed = now - _last_gemini_call
        if elapsed < GEMINI_MIN_INTERVAL:
            sleep_for = GEMINI_MIN_INTERVAL - elapsed
            logger.info(f"Rate limiting Gemini request. Sleeping for {sleep_for:.2f}s...")
            time.sleep(sleep_for)

        try:
            _last_gemini_call = time.time()
            return geminiClient.client.models.generate_content(
                model=geminiClient.selected_model,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": list[CreateConnection],
                },
            )
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            raise RuntimeError(f"Error generating content: {e}")

    def _create_connections_list(self, candidate_document):
        logger.info(f"Creating connections...")
        try:
            prompt = self._generate_prompt(candidate_document)
            response = self._rate_limited_generate(prompt)
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            raise RuntimeError(f"Error generating content: {e}")

        try:
            parsed_response = json.loads(response.text)
            logger.info(f"Parsed response: {parsed_response}")

            if not isinstance(parsed_response, list):
                logger.error(f"Error parsing response: {parsed_response}")
                return []
            else:
                self.staged_connections.extend(parsed_response)
                return parsed_response

        except Exception as e:
            logger.error(f"Error parsing response: {e}")
            logger.error(f"Raw response: {response}")
            return []

    def _generate_prompt(self, candidate_document):
        """
        Generates an advanced prompt for the Gemini Model to create meaningful, high-value connections
        between knowledge graph nodes that go beyond surface-level similarity.
        """
        GEMINI_CONNECTION_REASONING_PROMPT = f"""You are Charlotte, an advanced knowledge graph connection reasoning agent operating at an expert cognitive level. Your task is to discover profound, non-trivial connections between documents in a user's knowledge web that might not be immediately obvious.

        Input Context:
        - Primary Document (FROM): {candidate_document["model_candidate"]}
        - Potential Connection Documents (TO): {candidate_document["candidates_to_link"]}
        - Knowledge Web ID: {self.webId}
        - Previously Mapped Connections: {self.staged_connections}
        - Source ID: {self.sourceId}
        - Similarity scores indicate text similarity but DO NOT indicate connection quality
        - Content sources include: youtube transcripts, notes, PDFs, websites, and other knowledge artifacts

        CONNECTION QUALITY HIERARCHY (from lowest to highest value):
        1. AVOID: Surface keyword matching ("both mention AI")
        2. AVOID: Topical similarity ("both discuss machine learning")
        3. MINIMAL: Direct referential links ("cites the same paper")
        4. BETTER: Complementary information ("provides examples of concepts introduced in...")
        5. VALUABLE: Sequential development ("builds upon the framework by adding...")
        6. EXCELLENT: Conceptual bridges ("connects theoretical principles from X with practical applications in Y")
        7. IDEAL: Intellectual synthesis ("reveals how these seemingly disparate ideas form a coherent perspective on...")

        Advanced Connection Criteria (MUST satisfy at least one):
        • Reveals multi-hop intellectual pathways (A → B → C reasoning chains)
        • Exposes non-obvious causal relationships
        • Identifies conceptual frameworks shared across different domains
        • Uncovers temporal development of ideas across sources
        • Bridges theoretical propositions with empirical evidence
        • Reveals complementary perspectives on the same phenomenon
        • Identifies methodological parallels across different contexts

        STRICT CONSTRAINTS:
        • Generate 1-2 connections ONLY if they meet the quality threshold (levels 5-7)
        • No connections is better than low-quality connections
        • Never refer to documents by ID or as "candidate document"/"source document"
        • Use natural language that references specific content details
        • Each connection must illuminate something that would be valuable for deeper understanding
        • Prioritize precision over quantity

        Location-Specific References:
        • For videos: Convert timestamps to <a href="URL&t=TIME_IN_SECONDS" target="_blank">MM:SS</a> format
        • For documents: Reference specific page numbers, sections, or paragraphs
        • For websites: Reference specific headings or content sections

        Output Format:
        Structured JSON matching the CreateConnection model with:
        1. fromSourceId (provided)
        2. toSourceId (from candidates. ALWAYS REFER TO "sourceId" on the object)
        3. webId (provided)
        4. connection description

        ## Style guide for `connection description`:
        - Casual, present-tense, ~15 words, proper punctuation.
        - Start with the speaker or doc (“Marques says…”, “Paper X shows…”).  
        - Capture the **direction** implicitly: *the description should read naturally from the FROM doc’s perspective.*  
        - **Outgoing** example: “Marq mentions this concept → Trinetix explainer.”  
        - **Incoming** example: “Verge review slams it as half-baked.”  
        - No IDs, no quotation marks unless they are real quotes, no boilerplate.

        Before finalizing each connection, verify it meets these criteria:
        1. Would a subject matter expert find this connection insightful?
        2. Does this connection reveal something non-obvious?
        3. Would this connection enhance understanding of either document?
        4. Is the connection specific enough to be meaningful?

        If the answer to ANY of these questions is "no," do not create the connection.
        """

        return GEMINI_CONNECTION_REASONING_PROMPT
