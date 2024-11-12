from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId
from pymongo.collection import Collection
from src.core.config import settings
from typing import List, Dict, Any

client = MongoClient(settings.mongo_url)
db = client[settings.mongo_initdb_database]

def get_collection(collection_name: str) -> Collection:
    return db[collection_name]

### getters ###

def get_item_by_id(collection_name: str, id: str) -> Dict[str, Any]:
    collection = get_collection(collection_name)
    return collection.find_one({"id": id}, {"_id": 0})

def get_items_by_field(collection_name: str, field: str, value: Any, ascending: bool = True) -> List[Any]:
    collection = get_collection(collection_name)
    items = collection.find({field: value}, {"_id": 0})
    return list(items)

def get_all_items(collection_name: str) -> List[Dict[str, Any]]:
    collection = get_collection(collection_name)
    return list(collection.find())

def get_items_with_limit(collection_name: str, limit: int) -> List[Dict[str, Any]]:
    collection = get_collection(collection_name)
    return list(collection.find().limit(limit))

def count_items_in_collection(collection_name: str) -> int:
    collection = get_collection(collection_name)
    return collection.count_documents({})

def get_items_sorted_by_field(collection_name: str, field: str, ascending=True) -> List[Dict[str, Any]]:
    collection = get_collection(collection_name)
    sort_order = 1 if ascending else -1
    return list(collection.find().sort(field, sort_order))

### setters ###

def insert_item(collection_name: str, item: Dict[str, Any]) -> ObjectId:
    collection = get_collection(collection_name)
    return collection.insert_one(item).inserted_id

def insert_items(collection_name: str, items: List[Dict[str, Any]]) -> List[ObjectId]:
    collection = get_collection(collection_name)
    return collection.insert_many(items).inserted_ids

def update_item_by_id(collection_name: str, item_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
    collection = get_collection(collection_name)
    return collection.find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )

def update_items_by_field(collection_name, field, value, update_data):
    collection = get_collection(collection_name)
    return collection.update_many({field: value}, {"$set": update_data})

def replace_item_by_id(collection_name, item_id, new_data):
    collection = get_collection(collection_name)
    return collection.find_one_and_replace(
        {"_id": ObjectId(item_id)},
        new_data,
        return_document=ReturnDocument.AFTER
    )

def add_search_to_user(email, search_data):
    collection = get_collection('users')
    update_data = {
        "$push": {
            "analytics.searches": {
                "$each": [search_data],
                "$position": 0
            }
        }
    }

    return collection.find_one_and_update(
        {"email": email},
        update_data,
        return_document=ReturnDocument.AFTER
    )

def clear_search_history(email):
    collection = get_collection('users')
    user = collection.find_one({"email": email})
    if not user:
        raise ValueError(f"User with email {email} not found.")
    update_data = {
        "$set": {
            "analytics.searches": []
        }
    }
    updated_user = collection.find_one_and_update(
        {"email": email},
        update_data,
        return_document=ReturnDocument.AFTER
    )
    if updated_user:
        print("Search history cleared successfully!")
        return updated_user
    else:
        raise Exception("Failed to clear search history.")

### deleters ###

def delete_item_by_id(collection_name, item_id):
    """Delete an item by ID."""
    collection = get_collection(collection_name)
    return collection.delete_one({"_id": ObjectId(item_id)})

def delete_items_by_field(collection_name, field, value):
    """Delete multiple items by a specific field."""
    collection = get_collection(collection_name)
    return collection.delete_many({field: value})

def delete_all_items(collection_name):
    """Delete all items in a collection."""
    collection = get_collection(collection_name)
    return collection.delete_many({})