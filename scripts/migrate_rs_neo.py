from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()
#this script is for adding a reliability score to scraped articles

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

class Neo4jArticleReliability:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def calc_reliability(self, polarity: float, subjectivity: float) -> float:
        reliability_subjectivity = 1.0 - subjectivity
        reliability_polarity = 1.0 - abs(polarity)
        reliability_index = reliability_subjectivity * reliability_polarity
        return reliability_index * 100

    def update_article_reliability(self):
        with self.driver.session() as session:
            session.execute_write(self._update_reliability_scores)

    def check_reliability_score(self, article_id):
        with self.driver.session() as session:
            query = """
            MATCH (a:Article {id: $id})
            RETURN a.reliability_score AS reliability_score
            """
            result = session.run(query, id=article_id)
            for record in result:
                return record["reliability_score"]

    @staticmethod
    def _update_reliability_scores(tx):
        query = """
        MATCH (a:Article)
        WHERE a.sentiment IS NOT NULL AND a.subjectivity IS NOT NULL
        RETURN a, a.sentiment AS sentiment, a.subjectivity AS subjectivity
        """
        result = tx.run(query)
        result_list = [record for record in result]
        print(f"Found {len(result_list)} articles with sentiment and subjectivity.")

        for record in result_list:
            article_node = record["a"]
            sentiment = record["sentiment"]
            subjectivity = record["subjectivity"]

            reliability_index = Neo4jArticleReliability(uri, user, password).calc_reliability(sentiment, subjectivity)

            update_query = """
            MATCH (a:Article {id: $id})
            SET a.reliability_score = $reliability_score
            """
            tx.run(update_query, id=article_node["id"], reliability_score=reliability_index)

if __name__ == "__main__":
    neo4j_client = Neo4jArticleReliability(uri, user, password)
    try:
        print("Updating article reliability scores...")
        neo4j_client.update_article_reliability()
        print("Reliability scores updated successfully.")
    finally:
        neo4j_client.close()