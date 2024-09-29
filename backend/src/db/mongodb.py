from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId
from pymongo.collection import Collection
from src.core.config import settings
from typing import List, Dict, Any

client = MongoClient(settings.mongo_url)
db = client[settings.mongo_initdb_database]

def get_collection(collection_name: str) -> Collection:
    """Get a collection from the database.

    Args:
        collection_name (str): The name of the collection.

    Returns:
        Any: The collection object.

    Example:
        >>> get_collection("my_collection")
        Collection(Database(MongoClient(host=['localhost:27017'], document_class=dict, tz_aware=False, connect=True, **{'serverSelectionTimeoutMS': 30000}), 'my_database'), 'my_collection')
    """
    return db[collection_name]

### getters ###

def get_item_by_id(collection_name: str, id: str) -> Dict[str, Any]:
    """Get an item by ID from a collection.

    Args:
        collection_name (str): The name of the collection.
        id (str): The ID of the item.

    Returns:
        Dict[str, Any]: The item.

    Example:
        >>> get_item_by_id("my_collection", "123")
        {'_id': ObjectId('123'), 'name': 'John'}
    """
    collection = get_collection(collection_name)
    return collection.find_one({"id": id})

def get_items_by_field(collection_name: str, field: str, value: Any) -> List[Any]:
    """Get items by a specific field and value.

    Args:
        collection_name (str): The name of the collection.
        field (str): The field to search.
        value (Any): The value to match.

    Returns:
        List[Dict[str, Any]]: The list of matching items.

    Example:
        >>> get_items_by_field("my_collection", "name", "John")
        [{'_id': ObjectId('123'), 'name': 'John'}, {'_id': ObjectId('456'), 'name': 'John'}]
    """
    collection = get_collection(collection_name)
    items = collection.find({field: value}, {"_id": 0})
    return list(items)

def get_all_items(collection_name: str) -> List[Dict[str, Any]]:
    """Get all items from a collection.

    Args:
        collection_name (str): The name of the collection.

    Returns:
        List[Dict[str, Any]]: The list of all items.

    Example:
        >>> get_all_items("my_collection")
        [{'_id': ObjectId('123'), 'name': 'John'}, {'_id': ObjectId('456'), 'name': 'Jane'}]
    """
    collection = get_collection(collection_name)
    return list(collection.find())

def get_items_with_limit(collection_name: str, limit: int) -> List[Dict[str, Any]]:
    """Get a limited number of items from a collection.

    Args:
        collection_name (str): The name of the collection.
        limit (int): The maximum number of items to return.

    Returns:
        List[Dict[str, Any]]: The list of items.

    Example:
        >>> get_items_with_limit("my_collection", 2)
        [{'_id': ObjectId('123'), 'name': 'John'}, {'_id': ObjectId('456'), 'name': 'Jane'}]
    """
    collection = get_collection(collection_name)
    return list(collection.find().limit(limit))

def count_items_in_collection(collection_name: str) -> int:
    """Count the number of items in a collection.

    Args:
        collection_name (str): The name of the collection.

    Returns:
        int: The number of items.

    Example:
        >>> count_items_in_collection("my_collection")
        10
    """
    collection = get_collection(collection_name)
    return collection.count_documents({})

def get_items_sorted_by_field(collection_name: str, field: str, ascending=True) -> List[Dict[str, Any]]:
    """Get all items sorted by a specific field.

    Args:
        collection_name (str): The name of the collection.
        field (str): The field to sort by.
        ascending (bool, optional): Whether to sort in ascending order. Defaults to True.

    Returns:
        List[Dict[str, Any]]: The list of sorted items.

    Example:
        >>> get_items_sorted_by_field("my_collection", "age")
        [{'_id': ObjectId('123'), 'name': 'John', 'age': 25}, {'_id': ObjectId('456'), 'name': 'Jane', 'age': 30}]
    """
    collection = get_collection(collection_name)
    sort_order = 1 if ascending else -1
    return list(collection.find().sort(field, sort_order))

### setters ###

def insert_item(collection_name: str, item: Dict[str, Any]) -> ObjectId:
    """Insert an item into a collection.

    Args:
        collection_name (str): The name of the collection.
        item (Dict[str, Any]): The item to insert.

    Returns:
        ObjectId: The ID of the inserted item.

    Example:
        >>> insert_item("my_collection", {"name": "John"})
        ObjectId('123')
    """
    collection = get_collection(collection_name)
    return collection.insert_one(item).inserted_id

def insert_items(collection_name: str, items: List[Dict[str, Any]]) -> List[ObjectId]:
    """Insert multiple items into a collection.

    Args:
        collection_name (str): The name of the collection.
        items (List[Dict[str, Any]]): The items to insert.

    Returns:
        List[ObjectId]: The IDs of the inserted items.

    Example:
        >>> insert_items("my_collection", [{"name": "John"}, {"name": "Jane"}])
        [ObjectId('123'), ObjectId('456')]
    """
    collection = get_collection(collection_name)
    return collection.insert_many(items).inserted_ids

def update_item_by_id(collection_name: str, item_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update an item by ID.

    Args:
        collection_name (str): The name of the collection.
        item_id (str): The ID of the item.
        update_data (Dict[str, Any]): The data to update.

    Returns:
        Dict[str, Any]: The updated item.

    Example:
        >>> update_item_by_id("my_collection", "123", {"name": "John"})
        {'_id': ObjectId('123'), 'name': 'John'}
    """
    collection = get_collection(collection_name)
    return collection.find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )

def update_items_by_field(collection_name, field, value, update_data):
    """Update multiple items by a field."""
    collection = get_collection(collection_name)
    return collection.update_many({field: value}, {"$set": update_data})

def replace_item_by_id(collection_name, item_id, new_data):
    """Replace an entire item by ID."""
    collection = get_collection(collection_name)
    return collection.find_one_and_replace(
        {"_id": ObjectId(item_id)},
        new_data,
        return_document=ReturnDocument.AFTER
    )

def add_search_to_user(email, search_data):
    """Add a search to the list of searches in the user's analytics."""
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
    """Clear the list of searches in the user's analytics."""
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