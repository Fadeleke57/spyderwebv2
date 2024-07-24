from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def get_db():
    if driver:
        return driver.session()

def close_db():
    if driver:
        driver.close()

def run_query(query, parameters=None):
    session = get_db()
    try:
        result = session.run(query, parameters)
        return [record for record in result]
    finally:
        session.close()