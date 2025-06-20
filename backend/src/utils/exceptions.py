from fastapi import HTTPException


class StorageException(HTTPException):
    def __init__(self):
        super().__init__(status_code=405, detail="Storage limit exceeded")
