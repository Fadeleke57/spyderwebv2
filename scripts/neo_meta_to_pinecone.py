from neo4j import GraphDatabase
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()
# this script is for adding metadata from neo4j to pinecone
uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")


class Neo4jToPinecone:
    
    def __init__(self, uri, user, password, pinecone_api_key, pinecone_env):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        
        pinecone = Pinecone(api_key=pinecone_api_key)
        self.index_name = "article-embeddings"
        
        if self.index_name not in pinecone.list_indexes().names():
            pinecone.create_index(
                name=self.index_name, 
                dimension=384, 
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region=pinecone_env)
            )
        self.pinecone_index = pinecone.Index(name=self.index_name)
        
    def close(self):
        self.driver.close()

    def process_articles(self):
        """
        Fetch articles from Neo4j, and upsert metadata to Pinecone without overwriting vectors.
        """
        with self.driver.session() as session:
            session.execute_write(self._process_article_metadata(tx=session, pinecone_index=self.pinecone_index))

    @staticmethod
    def _process_article_metadata(tx, pinecone_index):
        """
        Query for articles, extract metadata (excluding the text field), and upload to Pinecone.
        """
        query = """
        MATCH (a:Article)
        RETURN a.id AS id, a.header AS header, a.sentiment AS sentiment, 
               a.subjectivity AS subjectivity, a.date_published AS date_published, 
               a.author AS author, a.topics AS topics, a.link AS link, 
               a.reliability_score AS reliability_score
        """
        result = tx.run(query)
        result_list = [record for record in result]
        print(f"Found {len(result_list)} articles.")

        for record in result_list:
            article_id = record["id"]
            header = record["header"]
            sentiment = record["sentiment"]
            subjectivity = record["subjectivity"]
            date_published = record["date_published"] or ""
            author = record["author"] or ""
            topics = record["topics"]
            link = record["link"]
            reliability_score = record["reliability_score"]

            metadata = {
                "header": header,
                "sentiment": sentiment,
                "subjectivity": subjectivity,
                "date_published": date_published,
                "author": author,
                "topics": topics, 
                "link": link,
                "reliability_score": reliability_score
            }

            existing_vector = pinecone_index.fetch([article_id]).vectors.get(article_id, None)

            if existing_vector:
                vector_data = [(article_id, existing_vector['values'], metadata)]
                print(f"Upserting metadata for article {article_id} without changing the vector...")
                pinecone_index.upsert(vector_data)
            else:
                print(f"No vector found for article {article_id}, skipping upsert...")

if __name__ == "__main__":
    neo4j_to_pinecone = Neo4jToPinecone(uri, user, password, PINECONE_API_KEY, PINECONE_ENVIRONMENT)
    
    try:
        print("Processing article metadata and adding to Pinecone...")
        neo4j_to_pinecone.process_articles()
        print("Metadata successfully added to Pinecone without overwriting vectors.")
    finally:
        neo4j_to_pinecone.close()