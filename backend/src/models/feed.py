from pydantic import BaseModel
from typing import List, Literal
from src.db.mongodb import get_collection
from datetime import datetime

Feeds = get_collection("feeds")

FeedType = Literal[
    "Claude Messages",
    "ChatGPT Messages",
    "Windsurf Messages",
    "Cursor Messages",
    "Watched Youtube Videos",
    "Liked X Tweets",
    "Black Board Files",
]


class Feed(BaseModel):
    feedId: str
    feedType: FeedType
    userId: str
    createdAt: datetime
    updatedAt: datetime


class ChatFeedItem(BaseModel):
    feedItemId: str
    feedId: str
    userId: str
    messages: List[str]
    createdAt: datetime
    updatedAt: datetime


ClaudeMessages = ChatFeedItem
ChatGPTMessages = ChatFeedItem
WindsurfMessages = ChatFeedItem
CursorMessages = ChatFeedItem


class WatchedYoutubeVideo(BaseModel):
    feedItemId: str
    feedId: str
    userId: str
    videoId: str
    createdAt: datetime
    updatedAt: datetime


class LikedXTweet(BaseModel):
    feedItemId: str
    feedId: str
    userId: str
    tweetId: str
    createdAt: datetime
    updatedAt: datetime


class BlackBoardFile(BaseModel):
    feedItemId: str
    feedId: str
    userId: str
    fileId: str
    createdAt: datetime
    updatedAt: datetime
