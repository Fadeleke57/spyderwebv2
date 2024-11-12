from pydantic import BaseModel
class Article(BaseModel):
    id: str
    header: str
    author: str
    date_published: str
    link: str
    text: str
    sentiment: float
    subjectivity: float
    reliability_score: float
    attachments: list[str] = []

class GenerateArticlesForBucketPayload(BaseModel):
    bucketId: str
    claim: str