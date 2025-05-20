from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from pydantic.fields import Field
from src.db.mongodb import get_collection
from pytz import UTC
from fastapi import HTTPException

Users = get_collection("users")


class User(BaseModel):
    id: str
    full_name: str
    username: str
    email: str
    disabled: bool
    bio: str = ""
    occupation: str = ""
    company: str = ""
    purpose: str = ""
    interest: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    profile_picture_url: Optional[str] = None
    websHidden: list[str] = []
    websSaved: list[str] = []
    websPinned: list[str] = []
    credits: int = 0
    subscription_plan: str = "free"
    last_credits_reset: datetime = Field(default_factory=lambda: datetime.now(UTC))
    storage_used: float = 0.0
    storage_last_calculated: datetime = Field(default_factory=lambda: datetime.now(UTC))
    is_yearly: bool = False
    stripe_customer_id: Optional[str] = None


class CreateUser(BaseModel):
    userId: str
    username: str
    email: str
    fullName: Optional[str] = None
    profilePictureUrl: Optional[str] = None


def create_user(createUser: CreateUser):
    if not createUser:
        raise ValueError("User data is required")

    try:

        user = User(
            id=createUser.userId,
            username=createUser.username,
            full_name=createUser.fullName or createUser.username,
            email=createUser.email,
            disabled=False,
            profile_picture_url=createUser.profilePictureUrl or "",
        )

        Users.insert_one(user.model_dump())
        return True

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UpdateUser(BaseModel):  # updating user
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    occupation: Optional[str] = None
    company: Optional[str] = None
    purpose: Optional[str] = None
    interest: Optional[str] = None
