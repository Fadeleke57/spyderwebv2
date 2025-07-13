from pydantic import BaseModel, ConfigDict
from typing import Union, Literal, List, Optional
from src.db.mongodb import get_collection
from datetime import datetime
from enum import Enum

Feeds = get_collection("feeds")

# -------------------------------------------------- Feed Types --------------------------------------------------


class AiClientFeedType(str, Enum):
    Claude = "Claude"
    ChatGPT = "ChatGPT"
    Cascade_Windsurf = "Cascade - Windsurf"
    Cursor = "Cursor"
    Cline = "Cline"
    Warp = "Warp"
    Other = "Other"
    Continue = "Continue"
    Roo_Cline = "Roo-Cline"
    Encovo = "Encovo"
    Highlight_AI = "Highlight AI"


class SocialFeedType(str, Enum):
    Youtube = "Youtube"
    Twitter = "X"
    TikTok = "TikTok"
    Instagram = "Instagram"
    Reddit = "Reddit"


class AdministriviaFeedType(str, Enum):
    BlackBoard = "BlackBoard"
    Google_Drive = "Google Drive"
    Dropbox = "Dropbox"
    OneDrive = "OneDrive"
    Slack = "Slack"
    Github_Issues = "Github Issues"
    Github_Pull_Requests = "Github Pull Requests"


class ProductivityFeedType(str, Enum):
    Raycast = "Raycast"


FeedType = Union[
    AiClientFeedType, SocialFeedType, AdministriviaFeedType, ProductivityFeedType
]

# -------------------------------------------------- Chat Messages --------------------------------------------------


class Message(BaseModel):
    role: Union[AiClientFeedType, Literal["User"]]
    content: str


AIContent = Union[str, List[Message]]

# -------------------------------------------------- Feed Content --------------------------------------------------
Content = Union[AIContent]

# -------------------------------------------------- Feed --------------------------------------------------


class Feed(BaseModel):
    feedId: str
    clientId: Optional[str] = None  # reference to the stytch connected app client id
    feedType: FeedType
    userId: str
    createdAt: datetime
    updatedAt: datetime
    visibility: Optional[Literal["Public", "Private"]] = "Public"


class PublicFeed(BaseModel):
    feedId: str
    clientId: Optional[str] = None  # reference to the stytch connected app client id
    feedType: FeedType
    createdAt: datetime
    updatedAt: datetime
    visibility: Optional[Literal["Public"]] = "Public"

    model_config = ConfigDict(extra="ignore")
