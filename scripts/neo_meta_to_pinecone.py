from neo4j import GraphDatabase
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
# this script is for adding metadata from neo4j to pinecone
uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

mongoUrl = os.getenv('MONGO_URL')
mongoInitdbDatabase = os.getenv('MONGO_INITDB_DATABASE')

client = MongoClient(mongoUrl)
db = client[mongoInitdbDatabase]
users = db['users']
buckets = db['webs']
sources = db['sources']
connections = db['connections']

class Neo4jToPinecone:
    
    def __init__(self, uri, user, password, pinecone_api_key, pinecone_env):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        
        pinecone = Pinecone(api_key=pinecone_api_key)
        self.index_name = PINECONE_INDEX_NAME
        
        if self.index_name not in pinecone.list_indexes().names():
            pinecone.create_index(
                name=self.index_name, 
                dimension=1024, 
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region=pinecone_env)
            )
        self.pinecone_index = pinecone.Index(name=self.index_name)
        
    def close(self):
        self.driver.close()

    def process_articles(self):
        """
        Fetch articles from Neo4j, and upsert metadata to Pinecone without overwriting vectors.
        """
        with self.driver.session() as session:
            session.execute_write(self._process_article_metadata(tx=session, pinecone_index=self.pinecone_index))

    @staticmethod
    def _process_article_metadata(tx, pinecone_index):
        """
        Query for articles, extract metadata (excluding the text field), and upload to Pinecone.
        """
        query = """
        MATCH (a:Article)
        RETURN a.id AS id, a.header AS header, a.sentiment AS sentiment, 
               a.subjectivity AS subjectivity, a.date_published AS date_published, 
               a.author AS author, a.topics AS topics, a.link AS link, 
               a.reliability_score AS reliability_score
        """
        result = tx.run(query)
        result_list = [record for record in result]
        print(f"Found {len(result_list)} articles.")

        for record in result_list:
            article_id = record["id"]
            header = record["header"]
            sentiment = record["sentiment"]
            subjectivity = record["subjectivity"]
            date_published = record["date_published"] or ""
            author = record["author"] or ""
            topics = record["topics"]
            link = record["link"]
            reliability_score = record["reliability_score"]

            metadata = {
                "header": header,
                "sentiment": sentiment,
                "subjectivity": subjectivity,
                "date_published": date_published,
                "author": author,
                "topics": topics, 
                "link": link,
                "reliability_score": reliability_score
            }

            existing_vector = pinecone_index.fetch([article_id]).vectors.get(article_id, None)

            if existing_vector:
                vector_data = [(article_id, existing_vector['values'], metadata)]
                print(f"Upserting metadata for article {article_id} without changing the vector...")
                pinecone_index.upsert(vector_data)
            else:
                print(f"No vector found for article {article_id}, skipping upsert...")
    
    def migrateSourcesToNeo(self):
        allSources = sources.find({})
        for source_doc in allSources:
            source_data = dict(source_doc)
            
            if '_id' in source_data:
                del source_data['_id']
            
            sourceId = source_data["sourceId"]
            print(f"Adding source {sourceId} to neo4j")
            try:
                with self.driver.session() as session:
   
                    properties = ", ".join([f"s.{key} = ${key}" for key in source_data.keys()])
            
                    query = f"""
                    CREATE (s:Source {{id: $sourceId}})
                    SET {properties}
                    RETURN s
                    """
                    
                    session.run(query, **source_data)
    
            except Exception as e:
                print(f"Failed to create source: {sourceId}. Error: {str(e)}")
    

    def update_pinecone_metadata_to_webid(self):
        """
        Updates Pinecone metadata to use webId instead of bucketId for all vectors.
        Simply copies the bucketId value to webId and removes bucketId.
        """
        try:
            allBuckets = buckets.find({})
            count = 0
            for bucket in allBuckets:
                webIdToPlace = bucket['webId']
                
                vector_data = self.pinecone_index.fetch([webIdToPlace], namespace="buckets").vectors.get(webIdToPlace, None)
                
                if vector_data and 'metadata' in vector_data:
                    metadata = vector_data['metadata']
                    print(metadata)
                    
                    if 'bucketId' in metadata:
                        metadata['webId'] = metadata['bucketId']
                        print("removing bucketId")
                        del metadata['bucketId']
                    
                    self.pinecone_index.upsert(
                        [(webIdToPlace, vector_data['values'], metadata)],
                        namespace="buckets"  
                    )
                    
                    count += 1
                    if count % 10 == 0:
                        print(f"Updated {count} buckets to use webId")
                else:
                    print(f"No vector found for bucketId: {webIdToPlace}")
                        
            print(f"Completed updating {count} buckets from bucketId to webId")

        except Exception as e:
            print(f"Error updating Pinecone metadata: {str(e)}")
            raise e
        
    def migrate_to_webs_namespace(self):
        """
        Migrates all embeddings and their metadata from 'buckets' namespace to 'webs' namespace,
        while also updating bucketId to webId in the metadata.
        """
        try:
            allBuckets = buckets.find({})
            count = 0
            success_count = 0
            
            # Get a list of all buckets to process
            bucket_list = list(allBuckets)
            total_buckets = len(bucket_list)
            print(f"Found {total_buckets} buckets to migrate")
            
            for bucket in bucket_list:
                count += 1
                webIdToPlace = bucket['webId']
                
                # Fetch the vector from the old namespace
                vector_data = self.pinecone_index.fetch([webIdToPlace], namespace="buckets").vectors.get(webIdToPlace, None)
                
                if vector_data and 'values' in vector_data:
                    # Get metadata and vector values
                    metadata = vector_data.get('metadata', {})
                    vector_values = vector_data['values']
                    
                    # Update metadata: replace bucketId with webId
                    if 'bucketId' in metadata:
                        metadata['webId'] = metadata['bucketId']
                        del metadata['bucketId']
                    else:
                        # Ensure webId exists in metadata
                        metadata['webId'] = webIdToPlace
                    
                    # Insert into the new namespace
                    self.pinecone_index.upsert(
                        [(webIdToPlace, vector_values, metadata)],
                        namespace="webs"  
                    )
                    
                    success_count += 1
                    
                    # Log progress
                    if count % 10 == 0 or count == total_buckets:
                        print(f"Migrated {count}/{total_buckets} vectors to 'webs' namespace")
                else:
                    print(f"No vector found for ID: {webIdToPlace} in 'buckets' namespace, skipping")
                
            print(f"Migration complete: {success_count}/{total_buckets} vectors successfully migrated to 'webs' namespace")
            
            # Optional: Verify the migration
            buckets_stats = self.pinecone_index.describe_index_stats()
            if 'namespaces' in buckets_stats:
                buckets_count = buckets_stats['namespaces'].get('buckets', {}).get('vector_count', 0)
                webs_count = buckets_stats['namespaces'].get('webs', {}).get('vector_count', 0)
                print(f"Verification - 'buckets' namespace: {buckets_count} vectors, 'webs' namespace: {webs_count} vectors")

        except Exception as e:
            print(f"Error migrating to 'webs' namespace: {str(e)}")
            raise e

if __name__ == "__main__":
    client = Neo4jToPinecone(uri=uri, user=user, password=password, pinecone_api_key=PINECONE_API_KEY, pinecone_env=PINECONE_ENVIRONMENT)
    try:
        client.migrate_to_webs_namespace()
    except Exception as e:
        print("Something went wrong!")