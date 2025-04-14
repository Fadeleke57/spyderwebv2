from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic.fields import Field
from src.db.mongodb import get_collection
from src.constants.credits import PLAN_CREDITS
from src.routes.auth.oauth2 import get_password_hash
from uuid import uuid4
from pytz import UTC
from fastapi import HTTPException

Users = get_collection("users")


class User(BaseModel):
    id: str
    full_name: str
    username: str
    email: str
    disabled: bool
    hashed_password: str
    bio: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    profile_picture_url: Optional[str] = None
    websHidden: list[str] = []
    websSaved: list[str] = []
    credits: int = PLAN_CREDITS["free"]
    subscription_plan: str = "free"
    last_credits_reset: datetime = Field(default_factory=lambda: datetime.now(UTC))
    storage_used: float = 0.0
    storage_last_calculated: datetime = Field(default_factory=lambda: datetime.now(UTC))
    is_yearly: bool = False
    stripe_customer_id: Optional[str] = None


class CreateUser(BaseModel):
    username: str
    email: str
    password: Optional[str] = None  # null for non oauth users
    profile_picture_url: Optional[str] = None


def create_user(create_user_data: CreateUser):
    if not create_user_data:
        raise ValueError("User data is required")

    try:
        user_id = str(uuid4())

        user = User(
            id=user_id,
            username=create_user_data.username,
            full_name=create_user_data.username,
            email=create_user_data.email,
            hashed_password=get_password_hash(create_user_data.password),
            disabled=False,
            profile_picture_url=create_user_data.profile_picture_url or "",
        )

        Users.insert_one(user.model_dump())
        return user_id

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UpdateUser(BaseModel):  # updating user
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    bio: Optional[str] = None
