from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE")]

def get_collection(collection_name):
    return database[collection_name]

def get_item_by_id(collection_name, item_id):
    collection = get_collection(collection_name)
    return collection.find_one({"_id": ObjectId(item_id)})