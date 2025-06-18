class ChunkingService:
    def __init__(
        self,
        TEXT_CHUNK_SIZE: int = 1000,
        TEXT_CHUNK_OVERLAP: int = 200,
        YOTUBE_CHUNK_DURATION: float = 90.0,
    ):
        self.TEXT_CHUNK_SIZE = TEXT_CHUNK_SIZE
        self.TEXT_CHUNK_OVERLAP = TEXT_CHUNK_OVERLAP
        self.YOTUBE_CHUNK_DURATION = YOTUBE_CHUNK_DURATION

    def chunk_clean_text(self, text: str):
        pass

    def chunk_youtube_transcript(self, transcript: str):
        pass

    def chunk_website_content(self, content: str):
        pass

    def chunk_document_content(self, content: str):
        pass

    def chunk_audio_content(self, content: str):
        pass

    def chunk_video_content(self, content: str):
        pass


service = ChunkingService()
