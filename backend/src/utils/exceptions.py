from fastapi import HTTPException
from typing import Optional


class StorageException(HTTPException):
    def __init__(self, detail: Optional[str] = None):
        super().__init__(status_code=405, detail=detail or "Storage limit exceeded")
