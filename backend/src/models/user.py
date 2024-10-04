from pydantic import BaseModel

class Search(BaseModel):
    query: str
    timestamp: str

class Analytics(BaseModel):
    searches: list[Search]

class User(BaseModel):
    id: str
    full_name: str
    username: str
    email: str
    disabled: bool
    hashed_password: str
    analytics: Analytics
    profile_picture_url: str