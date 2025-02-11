import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId
from src.core.config import settings

client = MongoClient(settings.mongo_url)
db = client[settings.mongo_initdb_database]
collection = db["users"]


def add_uuid_to_users():
    users_without_id = collection.find({"id": {"$exists": False}})
    updated_count = 0
    for user in users_without_id:
        new_uuid = str(uuid.uuid4())
        collection.update_one({"_id": user["_id"]}, {"$set": {"id": new_uuid}})
        updated_count += 1
        print(f"Updated user {user['_id']} with new id: {new_uuid}")

    print(f"Total users updated: {updated_count}")


if __name__ == "__main__":
    add_uuid_to_users()
