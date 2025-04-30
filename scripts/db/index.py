from pymongo import MongoClient
from pinecone import Pinecone, ServerlessSpec
from neo4j import GraphDatabase
from pytz import UTC
from datetime import datetime
import time

class MongoScriptsClient:
    def __init__(self):
        self.client = MongoClient("")
        self.database = self.client["storage"]
    
    def _get_collection(self, name : str):
        return self.database[name]

mongo_client = MongoScriptsClient()
Users = mongo_client._get_collection("users")
Webs = mongo_client._get_collection("webs")
 
class PineconeScriptsClient:
    def __init__(self):
        self.client = Pinecone(api_key="")
        self.index = self.client.Index(name="")
    
    def generate_embeddings(self, name: str, description: str, header_weight: int = 3) -> any:
        weighted_input = (name + ' ') * header_weight + description
        embeddings = self.client.inference.embed(
            model="multilingual-e5-large",
            inputs=[weighted_input],
                parameters={"input_type": "passage", "truncate": "END"}
        )
        return embeddings

pinecone_client = PineconeScriptsClient()

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


class Neo4jScriptsClient:

    def __init__(self):
        self.driver = GraphDatabase.driver("", auth=("neo4j", ""))

    def close(self):
        self.driver.close()

    def execute_query(self, query, parameters):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]

neo4j_client = Neo4jScriptsClient()

def sync_pinecone_source_metadata():
    for web in Webs.find():
        webId = web["webId"]
        print(f"Processing web {webId}")

        # 1. list all Pinecone IDs
        all_ids = []
        for ids_chunk in pinecone_client.index.list(namespace=webId):
            all_ids.extend(ids_chunk)
        print(f"Found {len(all_ids)} vectors in this web")

        # 2. Fetch metadata in batches
        batch_size = 100
        for i in range(0, len(all_ids), batch_size):
            batch_ids = all_ids[i:i+batch_size]
            fetch_response = pinecone_client.index.fetch(ids=batch_ids, namespace=webId)
            
            for vid, record in fetch_response.vectors.items():
                metadata = record.metadata
                print("Metadata for", vid, ":", metadata)
                sourceId = metadata.get("sourceId")
                
                # 3. Query Neo4j
                result = neo4j_client.execute_query(
                    "MATCH (s:source) WHERE s.sourceId=$sourceId RETURN s",
                    parameters={"sourceId": sourceId}
                )
                sources = [record["s"] for record in result]
                source = result[0]["s"] if sources else None
                
                if not source:
                    print(f"Source {sourceId} not found. Skipping {vid} and deleting from Pinecone.")
                    pinecone_client.index.delete(ids=[vid], namespace=webId)
                    continue
                
                print("Found source for ", vid, ":", source)
                # 4. Prepare metadata update
                new_meta = {}
                if metadata["type"] == "website":
                    new_meta["websiteTitle"] = source["name"]
                elif metadata["type"] in ["youtube", "youtube video"]:
                    new_meta.update({"youtubeTitle": source["name"], "type": "youtube video"})
                elif metadata["type"] in ["document", "pdf document"]:
                    new_meta["documentTitle"] = source["name"]
                elif metadata["type"] == "note":
                    new_meta["noteTitle"] = source["name"]
                else:
                    print(f"Unrecognized type: {metadata['type']}")
                    continue
                
                # 5. Update metadata WITHOUT affecting vectors
                pinecone_client.index.update(
                    id=vid,
                    set_metadata=new_meta,
                    namespace=webId
                )
            time.sleep(0.5)
        print(f"Completed web {webId}")
    print("All webs processed!")


if __name__ == "__main__":
    #update_webs_with_defaults()
    #update_users_with_defaults()
    sync_pinecone_source_metadata()