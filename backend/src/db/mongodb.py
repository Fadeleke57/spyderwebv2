from pymongo import MongoClient
from bson.objectid import ObjectId
from src.core.config import settings

client = MongoClient(settings.mongo_url)
database = settings.mongo_initdb_database

def get_collection(collection_name):
    return database[collection_name]

def get_item_by_id(collection_name, item_id):
    collection = get_collection(collection_name)
    return collection.find_one({"_id": ObjectId(item_id)})