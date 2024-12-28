import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()
# i'll use this as a general purpose script for updating users with new attributes
mongoUrl = os.getenv('MONGO_URL')
mongoInitdbDatabase = os.getenv('MONGO_INITDB_DATABASE')

client = MongoClient(mongoUrl)
db = client[mongoInitdbDatabase]
users = db['users']
buckets = db['buckets']

def add_uuid_to_users():
    users_without_id = users.find({"id": {"$exists": False}})
    updated_count = 0

    for user in users_without_id:
        new_uuid = str(uuid.uuid4())
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"id": new_uuid}}
        )

        updated_count += 1
        print(f"Updated user {user['_id']} with new id: {new_uuid}")

    print(f"Total users updated: {updated_count}")

def add_empty_likes_and_iterations_to_users():
    buckets_without_likes = buckets.find({"likes": {"$exists": True}})
    buckets_without_iterations = buckets.find({"iterations": {"$exists": True}})
    updated_count = 0

    for bucket in buckets_without_likes:
        buckets.update_one(
            {"_id": bucket["_id"]},
            {"$set": {"likes": []}}
        )
        updated_count += 1
        print(f"Updated bucket {bucket['_id']} with new likes: []")
    print(f"Total buckets updated: {updated_count}")

def migrate_buckets_to_visibility_attr():
    buckets_without_attr = buckets.find({"visibility": {"$exists": False}})
    updated_count = 0

    for bucket in buckets_without_attr:
        privacy_on = bucket["private"]
        buckets.update_one(
            {"_id": bucket["_id"]},
            {"$set": {"visibility": "Private" if privacy_on else "Public"}}
        )
        updated_count += 1
        print(f"Updated bucket {bucket['_id']} with new visibility: {'Private' if privacy_on else 'Public'}")
    print(f"Total buckets updated: {updated_count}")

def add_attr_to_users():
    users_without_saved_attr = users.find({"username": {"$exists": False}})
    updated_count = 0

    for user in users_without_saved_attr:
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"username": user["full_name"]}}
        )

        updated_count += 1
        print(f"Updated user {user['_id']} with new username: {user['full_name']}")

    print(f"Total users updated: {updated_count}")

def add_attr_to_buckets():
    buckets_without_attr = buckets.find({"iteratedFrom": {"$exists": False}})
    updated_count = 0

    for bucket in buckets_without_attr:
        buckets.update_one(
            {"_id": bucket["_id"]},
            {"$set": {"iteratedFrom": None}}
        )

        updated_count += 1
        print(f"Updated bucket {bucket['_id']} with new iteratedFrom: None")

    print(f"Total buckets updated: {updated_count}")

def clear_out_buckets_tags():
    updated_count = 0
    all_buckets = buckets.find()
    for bucket in all_buckets:
        buckets.update_one(
            {"_id": bucket["_id"]},
            {"$set": {"tags": []}}
        )

        updated_count += 1
        print(f"Updated bucket {bucket['_id']} with new tags: []")

    print(f"Total buckets updated: {updated_count}")

if __name__ == "__main__":
    add_attr_to_users()