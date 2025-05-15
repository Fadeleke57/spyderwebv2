from pymongo import MongoClient
from pinecone import Pinecone, ServerlessSpec
from neo4j import GraphDatabase
from pytz import UTC
from datetime import datetime
import time
import math
from tqdm import tqdm
from itertools import cycle

class MongoScriptsClient:
    def __init__(self):
        self.client = MongoClient("")
        self.database = self.client["storage"]
    
    def _get_collection(self, name : str):
        return self.database[name]

mongo_client = MongoScriptsClient()
Users = mongo_client._get_collection("users")
Webs = mongo_client._get_collection("webs")
Embeddings = mongo_client._get_collection("embeddings")
 
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

# mongo native scripts

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


# pinecone native scripts
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

def migrate_web_namespaces_to_sources():
    """Migrates all vectors from webId namespaces to a single 'sources' namespace"""
    target_namespace = "sources"
    batch_size = 100
    migrated_count = 0

    # Get all webIds from MongoDB
    web_ids = [web["webId"] for web in Webs.find()]
    print(f"Found {len(web_ids)} webs")

    for web_id in web_ids:
        print(f"\nMigrating namespace: {web_id}")
        all_ids = []
        
        # List all vector IDs in current namespace
        try:
            for ids_chunk in pinecone_client.index.list(namespace=web_id):
                all_ids.extend(ids_chunk)
        except Exception as e:
            print(f"Error listing vectors in {web_id}: {str(e)}")
            continue

        if not all_ids:
            print(f"No vectors found in {web_id}, skipping...")
            continue

        # Process in batches
        for i in range(0, len(all_ids), batch_size):
            batch_ids = all_ids[i:i+batch_size]
            
            try:
                # Fetch existing vectors
                fetch_response = pinecone_client.index.fetch(ids=batch_ids, namespace=web_id)
                vectors_to_upsert = [{
                    "id": vid,
                    "values": record.values,
                    "metadata": record.metadata
                } for vid, record in fetch_response.vectors.items()]

                # Upsert to target namespace
                if vectors_to_upsert:
                    # Delete from old namespace
                    pinecone_client.index.delete(ids=batch_ids, namespace=web_id)
                    pinecone_client.index.upsert(
                        vectors=vectors_to_upsert,
                        namespace=target_namespace
                    )
                    migrated_count += len(vectors_to_upsert)

                print(f"Migrated batch {(i//batch_size)+1} of {len(all_ids)//batch_size + 1} from {web_id}")

            except Exception as e:
                print(f"Error processing batch {i//batch_size} in {web_id}: {str(e)}")
            
            time.sleep(0.5)  # Rate limit protection

    print(f"\n✅ Migration complete! Total vectors migrated: {migrated_count}")
    return migrated_count

def sync_user_storage():
    all_users = list(Users.find())

    spinner = cycle(["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"])

    for user in tqdm(all_users, desc="Syncing user storage", unit="user"):
        # Optional: show user ID briefly
        print(f"  {next(spinner)} Syncing user: {user['id'][:6]}...", end="\r")

        all_user_sources = neo4j_client.execute_query(
            "MATCH (s:source) WHERE s.userId=$userId RETURN s",
            parameters={"userId": user["id"]}
        )
        user_sources = [record["s"] for record in all_user_sources]
        print(f"  {next(spinner)} Found {len(user_sources)} sources for user: {user['id'][:6]}...", end="\r")
        for source in user_sources:
            source_size = source.get("size", 0)

            bytesPerFloat32 = 4
            bytesPerVector = 1024 * bytesPerFloat32
            numVectors = math.ceil(source_size / 1100)
            vectorStorageBytes = numVectors * bytesPerVector

            Users.update_one(
                {"id": user["id"]},
                {"$inc": {"storage_used": source_size + vectorStorageBytes}}
            )

        time.sleep(0.1)  # Just to make the animation visible per user

    print("✅ Sync complete!")

def migrate_embeddings_to_mongodb():
    all_ids = []
    for ids_chunk in pinecone_client.index.list(namespace="sources"):
        all_ids.extend(ids_chunk)
    print(f"Found {len(all_ids)} vectors in sources")

    # 2. Fetch metadata in batches
    batch_size = 100
    insertions = []
    for i in range(0, len(all_ids), batch_size):
        batch_ids = all_ids[i:i+batch_size]
        fetch_response = pinecone_client.index.fetch(ids=batch_ids, namespace="sources")
        
        for vid, record in fetch_response.vectors.items():
            metadata = record.metadata

            result = neo4j_client.execute_query(
                    "MATCH (s:source) WHERE s.sourceId=$sourceId RETURN s",
                    parameters={"sourceId": metadata["sourceId"]}
            )
            sources = [record["s"] for record in result]
            source = result[0]["s"] if sources else None

            if not source:
                print("corresponding source not found..")
                pinecone_client.index.delete(ids=[vid], namespace="sources")
                continue

            pinecone_client.index.update(
                id=vid,
                namespace="sources",
                set_metadata={"webId": source["webId"]}
            )

            to_insert = {
                "embeddingId" : vid,
                "webId" : source["webId"],
                "sourceId" : metadata["sourceId"]
            }

            insertions.append(to_insert)
        time.sleep(0.5)
        print(f"Queued batch {(i//batch_size)+1} of {len(all_ids)//batch_size + 1} from sources namespace")

    Embeddings.insert_many(insertions)
    print("Finished")

def add_webid_to_chunks():
    embeddings = list(Embeddings.find())
    print(f"Found {len(embeddings)} embeddings")
    for embedding in embeddings:
        print(embedding)
        pinecone_client.index.update(
            id=embedding["embeddingId"],
            namespace="sources",
            set_metadata={"webId": embedding["webId"]}
        )
        print("Added webId to chunk", embedding["embeddingId"])
        time.sleep(0.5)

def reset_user_credits():
    Users.update_many({}, {"$set": {"credits": 0, "last_credits_reset": datetime.now(UTC), "updated_at": datetime.now(UTC)}})
    print("Credits reset for all users!")

def add_userid_to_chunks():
    embeddings = list(Embeddings.find())
    print(f"Found {len(embeddings)} embeddings")

    for i, embedding in enumerate(embeddings):
        print(f"Iteration {i} / {len(embeddings)}...")
        print("searching web for", embedding["webId"])
        web = Webs.find_one({"webId": embedding["webId"]})
    
        if not web:
            print("corresponding web not found..deleting..")
            pinecone_client.index.delete(ids=[embedding["embeddingId"]], namespace="sources")
            Embeddings.delete_one({"embeddingId": embedding["embeddingId"]})
            continue

        web_name = web.get("name")
        print(f"web found called: {web_name}")

        result = pinecone_client.index.update(
            id=embedding["embeddingId"],
            namespace="sources",
            set_metadata={"userId": web["userId"]}
        )
        if result == {}:
            print("Successfully added userId to chunk", embedding["embeddingId"])
            continue
        
        time.sleep(0.5)

if __name__ == "__main__":
    #update_webs_with_defaults()
    #update_users_with_defaults()
    #sync_pinecone_source_metadata()
    #migrate_web_namespaces_to_sources()
    #migrate_embeddings_to_mongodb() #run right after
    #add_webid_to_chunks()
    #add_userid_to_chunks()
    #sync_user_storage()
    reset_user_credits()