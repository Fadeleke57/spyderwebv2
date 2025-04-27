from pymongo import MongoClient
from pinecone import Pinecone, ServerlessSpec
from neo4j import GraphDatabase
from pytz import UTC
from datetime import datetime

class MongoScriptsClient:
    def __init__(self):
        self.client = MongoClient("mongodb+srv://fadeleke:IJerctTHeQraO5U7@spystorage.0w3ujn9.mongodb.net/")
        self.database = self.client["storage"]
    
    def _get_collection(self, name : str):
        return self.database[name]

mongo_client = MongoScriptsClient()
Users = mongo_client._get_collection("users")
Webs = mongo_client._get_collection("webs")
Sources = mongo_client._get_collection("sources")

"""
class PineconeScriptsClient:
    def __init__(self):
        self.client = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.client.Index(name=settings.pinecone_index_name)
    
    def generate_embeddings(self, name: str, description: str, header_weight: int = 3) -> any:
        weighted_input = (name + ' ') * header_weight + description
        embeddings = self.client.inference.embed(
            model="multilingual-e5-large",
            inputs=[weighted_input],
                parameters={"input_type": "passage", "truncate": "END"}
        )
        return embeddings

pinecone_client = PineconeScriptsClient()
"""

def update_webs_with_defaults():
    required_defaults = {
        "tags": [],
        "sourceIds": [],
        "imageKeys": [],
        "likes": [],
        "iterations": [],
        "iteratedFrom": None,
        "enableAIConnections": True,
        "showcase": False,
    }

    update_count = 0

    for web in Webs.find():
        updates = {}

        for key, default_value in required_defaults.items():
            if key not in web:
                updates[key] = default_value

        if updates:
            updates["updated"] = datetime.now(UTC)
            Webs.update_one({"_id": web["_id"]}, {"$set": updates})
            update_count += 1
            print(f"Updated {web['name']} with missing fields.")

    print(f"✅ Updated {update_count} web(s) with missing fields.")

def update_users_with_defaults():
    required_defaults = {
        "bio": "",
        "profile_picture_url": None,
        "websHidden": [],
        "websSaved": [],
        "websPinned": [],
        "imageKeys": [],
        "credits": 100,  # or settings.PLAN_CREDITS["free"] if dynamic
        "subscription_plan": "free",
        "last_credits_reset": datetime.now(UTC),
        "storage_used": 0.0,
        "storage_last_calculated": datetime.now(UTC),
        "is_yearly": False,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }

    attrs_to_remove = ["analytics"]

    update_count = 0

    for user in Users.find():
        updates = {}

        for key, default_value in required_defaults.items():
            if key not in user:
                print(f"Added {key} to {user['username']}")
                updates[key] = default_value
            
        for key in attrs_to_remove:
            if key in user:
                print(f"Removed {key} from {user['username']}")
                updates[key] = { "$unset": True }

        if updates:
            updates["updated_at"] = datetime.now(UTC)
            Users.update_one({"_id": user["_id"]}, {"$set": updates})
            update_count += 1

    print(f"✅ Updated {update_count} user(s) with missing fields.")

"""
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
"""


if __name__ == "__main__":
    #update_webs_with_defaults()
    update_users_with_defaults()