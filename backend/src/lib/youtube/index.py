import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig
from fastapi import HTTPException
from src.core.config import settings
from src.lib.logger.index import logger


class YoutubeAPIClient:
    def __init__(self):
        self.apiKey = settings.youtube_api_key
        self.transcriptsClient = YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=settings.proxy_username,
                proxy_password=settings.proxy_password,
            )
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
            response = self.transcriptsClient.get_transcript(video_id)
        except Exception as e:
            logger.error(f"Error getting video transcript: {str(e)}")
            raise HTTPException(
                status_code=400, detail="Could not retrieve the webpage"
            )

        return response


client = YoutubeAPIClient()
