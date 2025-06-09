import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig
from fastapi import HTTPException
from src.core.config import settings
from src.lib.logger.index import logger
import re
from urllib.parse import urlparse, parse_qs, ParseResult, ParseResultBytes
from typing import Union, List
import time
from youtube_transcript_api import NoTranscriptFound, TranscriptsDisabled, VideoUnavailable

class YoutubeAPIClient:
    def __init__(self):
        self.apiKey = settings.youtube_api_key
        
        # Initialize transcript client with session and proxy config
        self.transcriptsClient = YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=settings.proxy_username,
                proxy_password=settings.proxy_password,
            )
        )

    def get_video_info(self, video_id: str, max_retries: int = 3) -> dict:
        """
        Get the information of a YouTube video from its video ID.

        This function will call the YouTube API to retrieve the information of the video
        and return it as a dict with retry logic.

        Args:
            video_id (str): The ID of the video to retrieve.
            max_retries (int): Maximum number of retry attempts (default: 3).

        Returns:
            dict: A dict containing the video information.

        Raises:
            HTTPException: If there is an error with the API call after all retries.
        """
        url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={self.apiKey}"

        for attempt in range(max_retries):
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                if not data.get("items"):   
                    raise HTTPException(
                        status_code=404, 
                        detail="Video not found or is private/deleted"
                    )
                
                video = data["items"][0]
                formatted = {
                    "title": video["snippet"]["title"],
                    "description": video["snippet"]["description"],
                }
                return formatted

            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    logger.error(f"Error getting video info after {max_retries} attempts: {str(e)}")
                    raise HTTPException(
                        status_code=400, 
                        detail="Could not retrieve the video information"
                    )
                
                # Exponential backoff: 1s, 2s, 4s
                wait_time = 2 ** attempt
                logger.warning(f"Attempt {attempt + 1} failed, retrying in {wait_time}s: {str(e)}")
                time.sleep(wait_time)

    def get_video_transcript(self, video_id: str, max_retries: int = 2, languages: List[str] = None) -> list:
        """
        Given a video id, returns a list of transcripts from the YouTube video.
        Includes retry logic with exponential backoff and better error handling.
        
        Args:
            video_id (str): The YouTube video ID
            max_retries (int): Maximum number of retry attempts (default: 3)
            languages (list): Preferred languages in order of preference (default: ['en'])
            
        Returns:
            list: List of transcript segments or empty list if unavailable
        """
        if languages is None:
            languages = ['en']
            
        for attempt in range(max_retries):
            try:
                # First, check if transcripts are available
                transcript_list = self.transcriptsClient.list(video_id)
                
                # Try to find transcript in preferred languages
                try:
                    transcript = transcript_list.find_transcript(languages)
                except NoTranscriptFound:
                    # If preferred languages not found, try any available transcript
                    try:
                        transcript = transcript_list.find_generated_transcript(languages)
                    except NoTranscriptFound:
                        # Get any available transcript
                        available_transcripts = list(transcript_list)
                        if available_transcripts:
                            transcript = available_transcripts[0]
                        else:
                            logger.warning(f"No transcripts available for video {video_id}")
                            return []
                
                # Fetch the transcript data
                response = transcript.fetch()
                return response.to_raw_data()

            except TranscriptsDisabled:
                logger.warning(f"Transcripts are disabled for video {video_id}")
                return []
                
            except VideoUnavailable:
                logger.warning(f"Video {video_id} is unavailable")
                return []
                
            except NoTranscriptFound:
                logger.warning(f"No transcript found for video {video_id}")
                return []
        
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Error getting video transcript after {max_retries} attempts: {str(e)}")
                    return []
                
                # Standard exponential backoff for other errors
                wait_time = 2 ** attempt
                logger.warning(f"Transcript fetch attempt {attempt + 1} failed, retrying in {wait_time}s: {str(e)}")
                time.sleep(wait_time)

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
