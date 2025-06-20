from pymongo import MongoClient
from pymongo.collection import Collection
from src.core.config import settings

client = MongoClient(settings.mongo_url)
db = client[settings.mongo_initdb_database]


def get_collection(collection_name: str) -> Collection:
    return db[collection_name]
