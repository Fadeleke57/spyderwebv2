from pydantic import BaseModel
import requests
from fastapi import HTTPException
from src.core.config import settings
from src.lib.logger.index import logger
import re
from urllib.parse import urlparse, parse_qs, ParseResult, ParseResultBytes
from typing import TypedDict, Union

class YoutubeTranscriptResponse(BaseModel):
    success: bool
    transcript: list

class YoutubeTranscriptSnippet(TypedDict):
    text: str
    duration: float
    offset: float
    lang: str

class YoutubeAPIClient:
    def __init__(self):
        self.video_info_api_key = settings.youtube_api_key
        self.video_info_base_url = "https://www.googleapis.com/youtube/v3/videos"
        self.transcript_api_key = settings.youtube_transcripts_api_key
        self.transcript_base_url = (
            "https://youtube-transcript3.p.rapidapi.com/api/transcript"
        )
        self.transcript_headers = {
            "x-rapidapi-key": self.transcript_api_key,
            "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com",
        }

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
        try:
            response = requests.get(
                f"{self.video_info_base_url}?part=snippet&id={video_id}&key={self.video_info_api_key}"
            )
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

    def get_transcript_data(self, video_id: str):
        try:
            response = requests.get(
                f"{self.transcript_base_url}?videoId={video_id}",
                headers=self.transcript_headers,
            )
            response.raise_for_status()
            data = YoutubeTranscriptResponse(**response.json())
            if data.success:
                transcript = data.transcript
                return transcript
            else:
                return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting transcript data: {str(e)}")
            return []

    @staticmethod
    def extract_youtube_id(url: str) -> Union[str, None]:
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
