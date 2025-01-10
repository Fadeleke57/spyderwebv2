# from neo4j import GraphDatabase
from src.core.config import settings

NEO4J_URI = settings.neo4j_uri
NEO4J_USER = settings.neo4j_user
NEO4J_PASSWORD = settings.neo4j_password

# driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# def get_db():
#    if driver:
#       return driver.session()

# def close_db():
#    if driver:
#        driver.close()

# def run_query(query, parameters=None):
#    session = get_db()
#    try:
#       result = session.run(query, parameters)
#       return [record for record in result]
#   finally:
#       session.close()
