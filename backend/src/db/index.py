import asyncio
import logging
import signal
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks
from typing import List, Callable
from src.db.mongodb import client as mongoClient
from src.db.neo4j import client as neo4jClient
from src.lib.pinecone.index import client as pineconeClient


class GracefulExit:
    """
    Manage graceful shutdown of background tasks and database connections
    """

    def __init__(self):
        self.background_tasks: List[asyncio.Task] = []
        self.shutdown_requested = False
        self.shutdown_complete = asyncio.Event()

    def register_background_task(self, task: asyncio.Task):
        """
        Register a background task for graceful shutdown tracking
        """
        self.background_tasks.append(task)

    async def wait_for_tasks(self, timeout: float = 30.0):
        """
        Wait for all background tasks to complete with a timeout
        """
        if not self.background_tasks:
            return

        try:
            await asyncio.wait_for(
                asyncio.gather(*self.background_tasks, return_exceptions=True),
                timeout=timeout,
            )
        except asyncio.TimeoutError:
            logging.warning("Some background tasks did not complete within the timeout")
        except Exception as e:
            logging.error(f"Error during task shutdown: {e}")


def create_sigterm_handler(
    graceful_exit: GracefulExit, cleanup_funcs: List[Callable] = None
):
    """
    Create a SIGTERM handler with comprehensive shutdown logic
    """

    def sigterm_handler(signum, frame):
        if not graceful_exit.shutdown_requested:
            graceful_exit.shutdown_requested = True
            logging.info("SIGTERM received. Initiating graceful shutdown...")

            # Create an async task to handle shutdown
            async def shutdown():
                try:
                    # Execute any additional cleanup functions
                    if cleanup_funcs:
                        for func in cleanup_funcs:
                            try:
                                func()
                            except Exception as e:
                                logging.error(f"Error in cleanup function: {e}")

                    # Wait for background tasks to complete
                    await graceful_exit.wait_for_tasks()

                    # Final logging
                    logging.info("Graceful shutdown completed")
                except Exception as e:
                    logging.error(f"Shutdown process error: {e}")
                finally:
                    graceful_exit.shutdown_complete.set()
                    sys.exit(0)

            # Run the shutdown coroutine
            asyncio.create_task(shutdown())

    return sigterm_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Enhanced lifespan context manager with robust SIGTERM handling
    """
    graceful_exit = GracefulExit()
    app.state.graceful_exit = graceful_exit

    def cleanup_databases():
        try:
            mongoClient.close()
            neo4jClient.close()
            logging.info("Disconnected from MongoDB and Neo4j")
        except Exception as e:
            logging.error(f"Error during database disconnection: {e}")

    signal.signal(
        signal.SIGTERM,
        create_sigterm_handler(graceful_exit, cleanup_funcs=[cleanup_databases]),
    )

    try:

        mongoClient.server_info()
        neo4jClient.verify_connectivity()
        app.state.pinecone_index = pineconeClient.index
        logging.info("Successfully connected to MongoDB, Neo4j, and Pinecone!")

        yield

    except Exception as e:
        logging.error(f"Failed to connect to databases: {str(e)}")
        raise e

    finally:

        cleanup_databases()
