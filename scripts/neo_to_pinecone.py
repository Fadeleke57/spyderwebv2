from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()
# this script is for adding embeddings from neo4j article text to pinecone
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
        
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def close(self):
        self.driver.close()

    def generate_embeddings(self, header: str, text: str, header_weight: int = 2) -> list:
        """
        Generate vector embeddings by giving more weight to the header.
        """
        weighted_input = (header + ' ') * header_weight + text
        return self.model.encode(weighted_input).tolist()

    def process_articles(self):
        """
        Fetch articles from Neo4j, generate embeddings, and add them to Pinecone.
        If header or text is missing, the article is deleted from Neo4j.
        """
        with self.driver.session() as session:
            session.execute_write(self._process_article_embeddings(tx=session, pineconeIndex=self.pinecone_index))

    @staticmethod
    def _process_article_embeddings(tx, pineconeIndex):
        """
        Query for articles, generate embeddings, and upload them to Pinecone. Deletes
        nodes if header or text is missing.
        """
        query = """
        MATCH (a:Article)
        RETURN a.id AS id, a.header AS header, a.text AS text
        """
        result = tx.run(query)
        result_list = [record for record in result]
        print(f"Found {len(result_list)} articles.")

        for record in result_list:
            article_id = record["id"]
            header = record["header"]
            text = record["text"]

            # dlete the article if header or text is missing
            if header is None or text is None:
                print(f"Deleting article {article_id} due to missing header or text...")
                delete_query = """
                MATCH (a:Article {id: $id})
                DETACH DELETE a
                """
                tx.run(delete_query, id=article_id)
            else:
                # generate embeddings and upload to Pinecone
                embedding = Neo4jToPinecone(uri, user, password, PINECONE_API_KEY, PINECONE_ENVIRONMENT).generate_embeddings(header, text)

                # prepare for Pinecone upsert
                vector_data = [(article_id, embedding)]
                print(f"Upserting embedding for article {article_id} to Pinecone...")
                pineconeIndex.upsert(vector_data)

if __name__ == "__main__":
    neo4j_to_pinecone = Neo4jToPinecone(uri, user, password, PINECONE_API_KEY, PINECONE_ENVIRONMENT)
    
    try:
        print("Processing article embeddings and adding to Pinecone...")
        neo4j_to_pinecone.process_articles()
        print("Embeddings successfully added to Pinecone.")
    finally:
        neo4j_to_pinecone.close()