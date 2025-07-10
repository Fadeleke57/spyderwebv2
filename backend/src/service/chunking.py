import re
from src.models.feed import AiClientFeedType
from src.lib.logger.index import logger
from src.lib.youtube.index import YoutubeTranscriptSnippet
from pydantic import BaseModel
from src.models.index import Message
from typing import Union, Literal
from uuid import uuid4


class YoutubeChunk(BaseModel):
    text: str
    start_time: float
    end_time: float


class DocumentChunk(BaseModel):
    text: str
    pageNumber: int


class ChatChunk(BaseModel):
    text: str
    chatId: str
    messageId: str
    role: Union[Literal["User"], AiClientFeedType]


Chunk = Union[str, YoutubeChunk, DocumentChunk, ChatChunk]


class ChunkingService:
    """
    In-house chunking service for md and youtube transcript.
    """

    def __init__(
        self,
        TEXT_CHUNK_SIZE: int = 1000,
        TEXT_CHUNK_OVERLAP: int = 200,
        YOTUBE_CHUNK_DURATION: float = 90.0,
    ):
        self.TEXT_CHUNK_SIZE = TEXT_CHUNK_SIZE
        self.TEXT_CHUNK_OVERLAP = TEXT_CHUNK_OVERLAP
        self.YOTUBE_CHUNK_DURATION = YOTUBE_CHUNK_DURATION
        logger.info("CHUNKING SERVICE INITIALIZED!")

    def chunk_cleaned_md(self, text):
        """
        Split text into overlapping chunks of specified size.

        Args:
            text (str): The text to chunk

        Returns:
            list: List of text chunks
        """
        if not isinstance(text, str):
            raise ValueError("Text must be a string")

        # sanitize escaped newlines and remove obvious markdown/JSON artifacts like backticks
        text = text.replace("\\n", " ").replace("\n", " ").replace("\\", "")
        text = re.sub(r"\s+", " ", text)  # Normalize all whitespace

        # try sentence splitting
        sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", text.strip())

        # if sentence splitting fails and only one giant sentence is returned, fall back to fixed-size chunks
        if len(sentences) <= 1 and len(text) > self.TEXT_CHUNK_SIZE:
            logger.warning(
                "Fallback to fixed-size chunking due to malformed sentence structure."
            )
            return self._fallback_chunk(text)

        logger.info(f"Found {len(sentences)} sentences in text.")

        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            sentence_length = len(sentence)

            if (
                current_length + sentence_length > self.TEXT_CHUNK_SIZE
                and current_chunk
            ):
                chunks.append(" ".join(current_chunk))

                # keep overlap sentences
                overlap_sentences = []
                overlap_length = 0
                for s in reversed(current_chunk):
                    if overlap_length + len(s) + 1 <= self.TEXT_CHUNK_OVERLAP:
                        overlap_sentences.insert(0, s)
                        overlap_length += len(s) + 1
                    else:
                        break

                current_chunk = overlap_sentences
                current_length = overlap_length

            current_chunk.append(sentence)
            current_length += sentence_length + 1

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        logger.info(f"Created {len(chunks)} chunks for text.")
        return chunks

    def _fallback_chunk(self, text: str):
        """
        Fallback chunking method that splits the text into fixed-size chunks if sentence splitting fails.

        Args:
            text (str): The long string to chunk

        Returns:
            list: List of fallback chunks
        """
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + self.TEXT_CHUNK_SIZE, len(text))
            chunk = text[start:end].strip()
            chunks.append(chunk)
            start = max(end - self.TEXT_CHUNK_OVERLAP, start + 1)
            logger.info(f"Created chunk of size {len(chunk)}")
        logger.info(f"Fallback created {len(chunks)} chunks.")
        return chunks

    def chunk_youtube_transcript(
        self,
        transcript_data: list[YoutubeTranscriptSnippet],
    ):
        """
        Chunk transcript by time intervals.

        Args:
            transcript_data: List of transcript segments with 'text', 'offset', 'duration'
        Returns:
            List of chunked transcript segments with text, start time, and end time
        """
        chunks = []

        logger.info(f"Transcript data for video: {transcript_data}")
        # total duration of the video
        total_duration = float(transcript_data[-1]["offset"]) + float(
            transcript_data[-1]["duration"]
        )

        # create time windows
        time_windows = []
        current_time = 0

        while current_time < total_duration:
            end_time = min(current_time + self.YOTUBE_CHUNK_DURATION, total_duration)
            time_windows.append((current_time, end_time))
            current_time = end_time

        # assign segments to time windows
        for start_time, end_time in time_windows:
            window_segments = []

            for segment in transcript_data:
                segment_start = float(segment["offset"])
                segment_end = segment_start + float(segment["duration"])

                # check if segment overlaps with current time window
                if segment_end > start_time and segment_start < end_time:
                    window_segments.append(segment["text"])

            if window_segments:
                chunk = YoutubeChunk(
                    text=" ".join(window_segments),
                    start_time=start_time,
                    end_time=end_time,
                )
                chunks.append(chunk)

        return chunks

    def chunk_document_pages(
        self, document_pages: list[dict]
    ):  # list of dict {"text": str, "pageNumber": int}
        chunks = []
        for index, page in enumerate(document_pages):
            page_number = index + 1
            page_chunks = self.chunk_cleaned_md(page["text"])
            page_chunks_with_page_number = [
                DocumentChunk(text=chunk, pageNumber=page_number)
                for chunk in page_chunks
            ]
            chunks.extend(page_chunks_with_page_number)
        return chunks

    def chunk_chat_messages(self, messages: list[Message]):
        chunks = []
        chatId = str(uuid4())
        for message in messages:
            messageId = str(uuid4())
            message_chunks = self.chunk_cleaned_md(message.content)
            message_chunks_with_chat_id = [
                ChatChunk(
                    text=chunk, chatId=chatId, role=message.role, messageId=messageId
                )
                for chunk in message_chunks
            ]
            chunks.extend(message_chunks_with_chat_id)
        return chunks


service = ChunkingService()
