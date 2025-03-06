from fastapi import FastAPI
from src.db.mongodb import client as mongoClient
from src.db.neo4j import client as neo4jClient
from contextlib import asynccontextmanager
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.

    Connects to MongoDB and Neo4j on startup, verifies that they are connected,
    and disconnects from both when the application is shut down.
    """
    mongoClient.server_info()  # Connect to both
    neo4jClient.verify_connectivity()
    logging.info("Successfully connected to MongoDB and Neo4j")
    yield  # Disconnect from both
    mongoClient.close()
    neo4jClient.close()
    logging.info("Disconnected from MongoDB")
