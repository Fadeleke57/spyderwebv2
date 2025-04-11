from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from src.db.mongodb import get_collection
from src.constants.credits import PLAN_CREDITS
from pytz import UTC

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
    credits: int = PLAN_CREDITS["free"]  # Add initial credits
    subscription_plan: str = "free"
    last_credits_reset: datetime = datetime.now(UTC)
    storage_used: float = 0.0  # Storage used in bytes
    storage_last_calculated: datetime = datetime.now(UTC)
    is_yearly: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


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
