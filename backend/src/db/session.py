from neo4j import GraphDatabase
from src.core.config import settings

class Neo4jSession:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.neo4j_url, 
            auth=(settings.neo4j_user, settings.neo4j_password)
        )

    def get_session(self):
        return self.driver.session()

    def close(self):
        self.driver.close()

neo4j_session = Neo4jSession()

def get_db():
    session = neo4j_session.get_session()
    try:
        yield session
    finally:
        session.close()