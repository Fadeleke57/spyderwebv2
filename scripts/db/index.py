from scripts.config import settings
from pymongo import MongoClient
from pinecone import Pinecone, ServerlessSpec
from neo4j import GraphDatabase

class MongoScriptsClient:
    def __init__(self):
        self.client = MongoClient(settings.mongo_url)
        self.database = self.client[settings.mongo_initdb_root_database]
    
    def _get_collection(self, name : str):
        return self.database[name]
    
mongo_client = MongoScriptsClient()
Users = mongo_client._get_collection("users")
Webs = mongo_client._get_collection("webs")
Sources = mongo_client._get_collection("sources")


class PineconeScriptsClient:
    def __init__(self):
        self.client = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.client.Index(name=settings.pinecone_index_name)
    
    def generate_embeddings(self, name: str, description: str, header_weight: int = 3) -> any:
        """
        Generate vector embeddings by giving more weight to the header.
        """
        weighted_input = (name + ' ') * header_weight + description
        embeddings = self.client.inference.embed(
            model="multilingual-e5-large",
            inputs=[weighted_input],
                parameters={"input_type": "passage", "truncate": "END"}
        )
        return embeddings

pinecone_client = PineconeScriptsClient()


    
class Neo4jScriptsClient:

    def __init__(self):
        self.driver = GraphDatabase.driver(settings.neo4j_uri, auth=(settings.neo4j_username, settings.neo4j_password))

    def close(self):
        self.driver.close()

    def execute_query(self, query, parameters):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]
    
neo4j_client = Neo4jScriptsClient()