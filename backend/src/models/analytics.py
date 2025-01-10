from pydantic import BaseModel


class Search(BaseModel):  # tracked user search
    query: str
    timestamp: str


class Analytics(BaseModel):  # tracked user analytics
    searches: list[Search]
