

class ChunkingService():
    def __init__(self, TEXT_CHUNK_SIZE: int = 1000, TEXT_CHUNK_OVERLAP: int = 200, YOTUBE_CHUNK_DURATION: float = 90.0):
        self.TEXT_CHUNK_SIZE = TEXT_CHUNK_SIZE
        self.TEXT_CHUNK_OVERLAP = TEXT_CHUNK_OVERLAP
        self.YOTUBE_CHUNK_DURATION = YOTUBE_CHUNK_DURATION


service = ChunkingService()
