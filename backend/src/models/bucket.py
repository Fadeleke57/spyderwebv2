from pydantic import BaseModel
from typing import List, Optional
class Bucket(BaseModel):
    bucketId: str
    name: str
    description: str
    tags: list[str]
    userId: str
    articleIds: list[str] #list of article ids to fetch from neo4j
    sourceIds: list[str]
    imageKeys: list[str]
    created: str
    updated: str
    private: bool
    likes: list[str]
    iterations: list[str]

class BucketConfig(BaseModel):
    name: str
    description: str
    private: bool
    tags: list[str] = []
    articleIds: list[str] = []
    sourceIds: list[str] = []
    imageKeys: list[str] = []

class UpdateBucket(BaseModel):
    name: Optional[str]
    description: Optional[str]
    private: Optional[bool]

class LikeBucket(BaseModel):
    bucketId: str

class UnLikeBucket(BaseModel):
    bucketId: str
