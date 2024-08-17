from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.mongodb import get_item_by_id, client as mongo_client
from src.db.neo4j import driver as neo4j_driver, run_query
from contextlib import asynccontextmanager
import logging

logging.basicConfig(level=logging.DEBUG)

@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_client.server_info()  # Connect to both
    neo4j_driver.verify_connectivity()
    logging.info("Successfully connected to MongoDB and Neo4j")

    yield  # Disconnect from both
    mongo_client.close()
    neo4j_driver.close()
    logging.info("Disconnected from MongoDB and Neo4j")