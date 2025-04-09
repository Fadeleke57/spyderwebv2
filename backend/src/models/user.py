from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from src.db.mongodb import get_collection


Users = get_collection("users")


class User(BaseModel):  # user
    id: str
    full_name: str
    username: str
    email: str
    disabled: bool
    hashed_password: str
    bio: str
    created: datetime
    updated: datetime
    profile_picture_url: str
    websHidden: Optional[list[str]]
    websSaved: Optional[list[str]]


class CreateUser(BaseModel):  # creating user
    username: str
    email: str
    password: str


class UpdateUser(BaseModel):  # updating user
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    bio: Optional[str] = None
