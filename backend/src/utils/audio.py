import openai
from src.core.config import settings
from src.db.neo4j import client as neo4jClient
from datetime import datetime
from pytz import UTC
from src.lib.logger.index import logger

async def get_audio_transcript(file_path: str) -> str:
    """
    Transcribe an audio file using OpenAI's Whisper API.

    Args:
        file_path (str): Path to the audio file

    Returns:
        str: The transcribed text
    """
    try:
        with open(file_path, "rb") as audio_file:
            response = await openai.Audio.atranscribe(
                "whisper-1",
                audio_file,
                api_key=settings.openai_api_key
            )
            return response.text
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise Exception(f"Transcription failed: {str(e)}")

