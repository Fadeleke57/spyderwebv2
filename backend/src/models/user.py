from pydantic import BaseModel
from typing import Optional

class Search(BaseModel):
    query: str
    timestamp: str

class Analytics(BaseModel):
    searches: list[Search]

class User(BaseModel): #user
    id: str
    full_name: str
    username: str
    email: str
    disabled: bool
    hashed_password: str
    analytics: Analytics
    profile_picture_url: str
    bucketsHidden: Optional[list[str]]
    bucketsSaved: Optional[list[str]]

class CreateUser(BaseModel): #creating user
    username: str
    email: str
    password: str

class UpdateUser(BaseModel): #updating user
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None