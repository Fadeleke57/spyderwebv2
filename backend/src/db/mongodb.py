from pymongo import MongoClient
from pymongo.collection import Collection
from src.core.config import settings

client = MongoClient(
    host=settings.mongo_url,
    maxPoolSize=50,
    minPoolSize=10,
    connectTimeoutMS=10000,
    socketTimeoutMS=30000,
)
db = client[settings.mongo_initdb_database]


def get_collection(collection_name: str) -> Collection:
    return db[collection_name]
