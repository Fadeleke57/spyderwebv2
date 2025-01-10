import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import random
import string
from dotenv import load_dotenv
from urllib.parse import urlparse
from datetime import datetime
from pytz import UTC

def generate_username():
    adjectives = [
    "swift", "silent", "brave", "clever", "witty", "nimble", "mighty", "fierce",
    "jolly", "breezy", "chill", "wild", "quirky", "lazy", "zesty", "epic", "cosmic",
    "bold", "sassy", "cheerful", "daring", "loyal", "vivid", "stormy", "zany", "snappy",
    "nimble", "graceful", "cunning", "fearless", "glowing", "serene", "playful", 
    "spirited", "roaring", "timeless", "bubbly", "cheeky", "gentle", "radiant", 
    "whimsical", "feisty", "frosty", "gritty", "stellar", "heroic", "mystic", "dashing", 
    "glorious", "sturdy", "proud", "courageous", "wily", "sly", "lively", "sparkly", 
    "frosty", "gleaming", "jovial", "vibrant", "gleeful", "quirky", "sunny", "tenacious", 
    "valiant", "zippy", "zesty", "zippy", "fancy", "bouncy", "hasty", "glittering",
    "dreamy", "tidy", "chirpy", "fiery", "rusty", "peppy", "sneaky", "perky", "silly"
    ]
    nouns = [
    "panda", "hawk", "fox", "tiger", "bear", "wolf", "otter", "falcon", "llama",
    "turtle", "cobra", "moose", "dragon", "unicorn", "phoenix", "raven", "lynx", 
    "panther", "eagle", "ferret", "coyote", "badger", "giraffe", "wolverine", 
    "hedgehog", "mongoose", "cheetah", "leopard", "owl", "parrot", "swan", "chameleon", 
    "dolphin", "orca", "shark", "stingray", "lobster", "crab", "flamingo", "penguin",
    "jaguar", "cougar", "zebra", "rhino", "elk", "antelope", "gazelle", "bat", "toad",
    "frog", "gecko", "iguana", "python", "viper", "macaw", "tamarin", "lemur", 
    "koala", "kangaroo", "platypus", "octopus", "seal", "narwhal", "walrus", "peacock",
    "sparrow", "finch", "beetle", "butterfly", "moth", "lynx", "mongoose", "fox", 
    "puffin", "weasel", "wombat", "pelican", "orca", "stingray", "jellyfish", "squid",
    "sloth", "armadillo", "tapir", "okapi", "hyena", "aardvark", "quokka", "manatee",
    "beaver", "chipmunk", "meerkat", "tamarin", "toucan", "kangaroo", "albatross"
    ]
    
    # Generate a random combination
    adjective = random.choice(adjectives)
    noun = random.choice(nouns)
    number = ''.join(random.choices(string.digits, k=4))
    
    # Combine them to form a username
    username = f"{adjective}{noun}{number}"
    return username

load_dotenv()
# i'll use this as a general purpose script for updating users with new attributes
mongoUrl = os.getenv('MONGO_URL')
mongoInitdbDatabase = os.getenv('MONGO_INITDB_DATABASE')

client = MongoClient(mongoUrl)
db = client[mongoInitdbDatabase]
users = db['users']
buckets = db['buckets']
sources = db['sources']

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
    users_without_saved_attr = users.find({"bio": {"$exists": False}})
    all_users = users.find()
    updated_count = 0

    for user in all_users:

        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"analytics": {} }}
        )

        updated_count += 1
        print(f"Updated user {user['_id']} with new analytics")

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
        created = bucket.get("created_at", None) or bucket.get("created", None) or datetime.now(UTC)
        last_updated = bucket.get("updated_at", None) or bucket.get("updated", None) or datetime.now(UTC)
        sources.update_one(
            {"_id": bucket["_id"]},
            {"$set": {"updated": last_updated, "created": created}}
        )

        updated_count += 1
        print(f"Updated bucket {bucket['_id']} with new updated: {last_updated}")
    sources.update_many({}, {"$unset": {"updated_at": "", "created_at": ""}})
    print(f"Total buckets updated: {updated_count}")

def extract_file_path(url):
    # Parse the URL
    parsed_url = urlparse(url)
    # Extract and return the path
    return parsed_url.path    

if __name__ == "__main__":
    clear_out_buckets_tags()