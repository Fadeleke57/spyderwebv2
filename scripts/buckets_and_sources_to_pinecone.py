import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import random
import string
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from urllib.parse import urlparse
from datetime import datetime
from pytz import UTC

load_dotenv()
mongoUrl = os.getenv('MONGO_URL')
mongoInitdbDatabase = os.getenv('MONGO_INITDB_DATABASE')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")

client = MongoClient(mongoUrl)
db = client[mongoInitdbDatabase]
users = db['users']
buckets = db['buckets']
sources = db['sources']

pinecone = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pinecone.Index(name=PINECONE_INDEX_NAME)


def add_document_text_to_sources(sourceId):
    source = sources.find_one({'sourceId': sourceId})
    pass

def add_website_content_to_sources(sourceId):
    source = sources.find_one({'sourceId': sourceId})
    url = source['url']


def add_youtube_transcripts_to_sources(sourceId):
    source = sources.find_one({'sourceId': sourceId})

def generate_embeddings(name: str, description: str, header_weight: int = 3) -> any:
    """
    Generate vector embeddings by giving more weight to the header.
    """
    weighted_input = (name + ' ') * header_weight + description
    embeddings = pinecone.inference.embed(
        model="multilingual-e5-large",
        inputs=[weighted_input],
            parameters={"input_type": "passage", "truncate": "END"}
    )
    return embeddings


if __name__ == "__main__":   
   
    for bucket in buckets.find():
        name = bucket['name']
        description = bucket['description']

        if name == "Welcome to Spydr!":
            continue

        print("Generating embeddings for bucket", name)
        embeddings = generate_embeddings(name, description)

        metadata = bucket.copy()
        metadata.pop('_id', None)
        if "iteratedFrom" in metadata:
            metadata.pop('iteratedFrom', None)

        vector_data = [(bucket['bucketId'], embeddings.data[0].values, metadata)]
        pinecone_index.upsert(vector_data, namespace="buckets")
        print("Adding embeddings to Pinecone...")
   
    """
    for bucket in buckets.find():
        bucketId = bucket['bucketId']
        pinecone_index.update(bucketId, set_metadata={"updated": bucket['updated'], "created": [bucket['created']]}, namespace="buckets")
        
    sourceIds = bucket['sourceIds']
    for sourceId in sourceIds:
        source = sources.find_one({'sourceId': sourceId})
        if source['type'] == 'document':
            print("Adding document text to source", sourceId)
            add_document_text_to_sources(sourceId)
        elif source['type'] == 'website':
            print("Adding website content to source...", sourceId)
            add_website_content_to_sources(sourceId)
        elif source['type'] == 'youtube':
            print("Adding youtube transcripts to source", sourceId)
            add_youtube_transcripts_to_sources(sourceId)
    print("Finished updating sources for bucket", bucket['bucketId'])
    """
        
 

        
    