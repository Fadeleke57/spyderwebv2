import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig
from fastapi import HTTPException
from src.core.config import settings
from src.lib.logger.index import logger
import re
from urllib.parse import urlparse, parse_qs, ParseResult, ParseResultBytes
from typing import Union
import traceback


class YoutubeAPIClient:
    def __init__(self):
        self.apiKey = settings.youtube_api_key
        self.transcriptsClient = YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=settings.proxy_username,
                proxy_password=settings.proxy_password,
                retries_when_blocked=50,
            )
        )
        logger.info(
            f"YOUTUBE CLIENT INITIALIZED with proxy username: {settings.proxy_username} and proxy password: {settings.proxy_password}"
        )

    def get_video_info(self, video_id: str) -> dict:
        """
        Get the information of a YouTube video from its video ID.

        This function will call the YouTube API to retrieve the information of the video
        and return it as a dict.

        Args:
            video_id (str): The ID of the video to retrieve.

        Returns:
            dict: A dict containing the video information.

        Raises:
            HTTPException: If there is an error with the API call.
        """
        url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={self.apiKey}"

        try:
            response = requests.get(url)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting video info: {str(e)}")
            raise HTTPException(
                status_code=400, detail="Could not retrieve the webpage"
            )

        video = response.json().get("items")[0]
        formatted = {
            "title": video["snippet"]["title"],
            "description": video["snippet"]["description"],
        }
        return formatted

    def get_video_transcript(self, video_id: str) -> list:
        """
        Given a video id, returns a list of transcripts from the YouTube video.
        Raises a 400 error if an exception occurs.
        """
        try:
            logger.info(f"Fetching video transcript for video id: {video_id}")
            response = None

            try:
                response = self.transcriptsClient.fetch(video_id)
            except Exception as e:
                logger.error(f"Error fetching video transcript: {str(e)}")

            response = response.to_raw_data() if response else []
            return response

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error getting video transcript: {str(e)}")
            return []

    def extract_youtube_id(self, url: str) -> Union[str, None]:
        """
        Extract YouTube video ID from various YouTube URL formats.

        Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - https://www.youtube.com/v/VIDEO_ID

        Args:
            url (str): YouTube URL

        Returns:
            str: Video ID if found, None otherwise
        """
        if not url:
            return None

        # Parse the URL
        parsed: Union[ParseResult, ParseResultBytes] = urlparse(url)

        # Handle youtu.be short links
        if parsed.hostname in ["youtu.be", "www.youtu.be"]:
            return parsed.path[1:]  # Remove leading slash

        # Handle youtube.com URLs
        if parsed.hostname in ["youtube.com", "www.youtube.com", "m.youtube.com"]:
            # Standard watch URL
            if parsed.path == "/watch":
                return parse_qs(parsed.query).get("v", [None])[0]

            # Embed URL
            if parsed.path.startswith("/embed/"):
                return parsed.path.split("/")[2]

            # Old style /v/ URL
            if parsed.path.startswith("/v/"):
                return parsed.path.split("/")[2]

        # Fallback: try to extract 11-character alphanumeric ID with regex
        match = re.search(r"[a-zA-Z0-9_-]{11}", url)
        return match.group(0) if match else None


client = YoutubeAPIClient()
