from pydantic import BaseModel
from typing import List, Optional, Literal
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
    visibility: Literal["Private", "Public", "Invite"]
    likes: list[str]
    iteratedFrom: Optional[str] #userId 
    iterations: list[str]

class BucketConfig(BaseModel):
    name: str
    description: str
    visibility: Literal["Private", "Public", "Invite"]
    tags: list[str] = []
    articleIds: list[str] = []
    sourceIds: list[str] = []
    imageKeys: list[str] = []

class UpdateBucket(BaseModel):
    name: Optional[str]
    description: Optional[str]
    visibility: Literal["Private", "Public", "Invite"]

class IterateBucket(BaseModel):
    name: str
    description: str

class LikeBucket(BaseModel):
    bucketId: str

class UnLikeBucket(BaseModel):
    bucketId: str
