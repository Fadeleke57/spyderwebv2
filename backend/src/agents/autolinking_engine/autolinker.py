from src.lib.logger.index import logger
from typing import Any
from src.agents.autolinking_engine.candidate_selector import CandidateSelectorAgent
from src.agents.autolinking_engine.connection_reasoning import ConnectionReasoningAgent
from src.models.process import create_process, update_process
from src.models.web import Webs, Web


class AutoLinkerEngine:  # proccess running CandidateSelectorAgent and ConnectionGeneratorAgent in the background
    def __init__(self):
        self.enabled = False
        self.running = False

        # vector stage is where vectors will be staged right before being upserted, that way we running the autolinked won't bottleneck the main thread
        self.vector_stage: list[tuple[str, list[float], dict[str, Any]]] = []

        self.webId = None
        self.sourceId = None
        self.jobId = None

        logger.info("AUTO LINKER INITIALIZED!")

    def add_vector_to_stage(self, vector: tuple[str, list[float], dict[str, Any]]):
        self.vector_stage.append(vector)

    def _reset(self):
        self.vector_stage = []
        self.running = False
        self.jobId = None
        self.webId = None
        self.sourceId = None
        self.enabled = False

    def configure(self, webId: str, sourceId: str):
        self.webId = webId
        self.sourceId = sourceId
        web_to_autolink: Web = Webs.find_one({"webId": webId})
        self.enabled = web_to_autolink["enableAIConnections"]

    def run(self):
        logger.info(f"Running AutoLinkerEngine...")
        try:

            if not self.enabled or len(self.vector_stage) == 0:
                logger.info("auto-linking is disabled..Shutting down...")
                return

            self.running = True
            self.jobId = create_process(
                web_id=self.webId,
                type="autolink",
                description="Charlie is finding connections for you...",
            )

            cs = CandidateSelectorAgent(webId=self.webId, sourceId=self.sourceId)
            cr = ConnectionReasoningAgent(webId=self.webId, sourceId=self.sourceId)

            # for each vector in the stage, find top candidates and create candidate document, which is a dictioary containing the model source and the chosen candidates
            for index, vector in enumerate(self.vector_stage):
                id, embedding, metadata = vector

                # find top candidates
                raw_candidates = cs.find_top_candidates(embedding=embedding)

                if not raw_candidates:
                    logger.info("No candidates found..Shutting down...")
                    return

                # create candidate document which is a dictioary containing the "model" source and "chosen_candidates"
                candidate_document = cs.create_candidate_doc(
                    raw_candidates=raw_candidates, model_candidate_metadata=metadata
                )

                # create relationships in neo4j
                cr.create_relationships_in_db(candidate_document)
                update_process(
                    job_id=self.jobId,
                    status="processing",
                    description="Charlie is finding connections for you...",
                    percentage=round((index + 1) / len(self.vector_stage) * 100, 2),
                )

            update_process(
                job_id=self.jobId,
                description="Charlie has finished finding connections for you!",
                status="completed",
                percentage=100,
            )

        except Exception as e:
            logger.error(f"Error running AutoLinkerEngine: {e}")
            raise RuntimeError(f"Error running AutoLinkerEngine: {e}")

        finally:
            self._reset()


engine = AutoLinkerEngine()
