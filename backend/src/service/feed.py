from uuid import uuid4
from datetime import datetime
from pytz import UTC
from src.models.index import FeedType, Feed, Feeds


class FeedService:
    def __init__(self):
        pass

    def create_feed(self, feed_type: FeedType, user_id: str) -> Feed:
        feed_id = str(uuid4())
        feed = Feed(
            feedId=feed_id,
            feedType=feed_type,
            userId=user_id,
            createdAt=datetime.now(UTC),
            updatedAt=datetime.now(UTC),
            visibility="Public",
        )
        Feeds.insert_one(feed.model_dump())
        return feed


service = FeedService()
