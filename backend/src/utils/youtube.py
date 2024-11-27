
import requests
from src.core.config import settings
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import HTTPException
API_KEY = settings.youtube_api_key

def get_video_info(video_id : str) -> dict:
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
    url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={API_KEY}"
    try :
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail="Could not retrieve the webpage")
    video = response.json().get("items")[0]
    formatted = {
        "title": video["snippet"]["title"],
        "description": video["snippet"]["description"],
    }
    return formatted

def get_video_transcript(video_id : str) -> list:
    """
    Given a video id, returns a list of transcripts from the YouTube video.
    Raises a 400 error if an exception occurs.
    """
    try:
        response = YouTubeTranscriptApi.get_transcript(video_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not retrieve the webpage")
    return response