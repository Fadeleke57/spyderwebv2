from pydantic import BaseModel
from typing import List
class Bucket(BaseModel):
    bucketId: str
    name: str
    description: str
    tags: list[str]
    userId: str
    articleIds: list[str] #list of article ids to fetch from neo4j
    imageKeys: list[str]
    created: str
    updated: str
    private: bool

class BucketConfig(BaseModel):
    name: str
    description: str
    private: bool
    tags: list[str] = []
    articleIds: list[str] = []
    imageKeys: list[str] = []
