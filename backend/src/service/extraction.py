import os
from typing import List
from src.lib.logger.index import logger
import pymupdf4llm
import pymupdf
from src.lib.youtube.index import client as youtube_client
from src.lib.firecrawl.index import client as firecrawl_client
from src.lib.openai.index import client as openai_client


class ExtractionService:
    def __init__(self):
        pymupdf.pro.unlock()
        logger.info("EXTRACTION SERVICE INITIALIZED!")

    def extract_youtube_transcript(self, video_id: str):
        """
        Extracts the transcript of a YouTube video from the provided video ID.

        Args:
            video_id (str): The ID of the YouTube video to extract the transcript from.

        Returns:
            str: The extracted transcript of the YouTube video.
        """
        return youtube_client.get_transcript_data(video_id)

    def extract_website_content(self, url: str) -> tuple[str, dict]:
        """
        Extracts the content of a website from the provided URL.

        Args:
            url (str): The URL of the website to extract content from.

        Returns:
            tuple[str, dict]: A tuple containing the extracted content and the metadata of the website.
        """
        markdown, metadata = firecrawl_client.get_markdown(url=url, with_metadata=True)

        logger.info(f"Website content extracted successfully: markdown is {markdown}")
        return markdown, metadata

    def extract_document_content(self, file_path: str) -> List[dict]:
        """
        Extracts the content of a document from the provided file path. Documents are PDFs, DOCXs, and PPTXs.

        Args:
            file_path (str): The file path of the document to extract content from.

        Returns:
            list: The extracted content of the document.
        """
        try:
            # extract Markdown for each page as a list of dictionaries
            data = pymupdf4llm.to_markdown(
                file_path, page_chunks=True
            )  # returns a list of {"text": "", "pageNumber": int}

            os.remove(file_path)
            if not data:
                logger.info("No text found in document")
                return
            return data

        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise RuntimeError(f"Error processing document: {e}")

    def extract_audio_content(self, file_path: str) -> str:
        """
        Extracts the content of an audio file from the provided file path.

        Args:
            file_path (str): The file path of the audio file to extract content from.

        Returns:
            str: The extracted content of the audio file.
        """
        try:
            # extract text from audio file
            data = openai_client.get_audio_transcript(file_path)

            os.remove(file_path)
            if not data:
                logger.info("No text found in audio file")
                return
            return data

        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            raise RuntimeError(f"Error processing audio file: {e}")


service = ExtractionService()
