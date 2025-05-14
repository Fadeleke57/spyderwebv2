import math
from src.models.index import Users
from src.lib.logger.index import logger
from fastapi import HTTPException
from typing import Literal
from datetime import datetime
from pytz import UTC

STORAGE_LIMITS_MB = {  # for frontend
    "free": 2048,
    "basic": 51200,
    "pro": 204800,
}

STORAGE_LIMITS_BYTES = {
    tier: mb * 1024 * 1024 for tier, mb in STORAGE_LIMITS_MB.items()
}


def handleTextStorage(
    extractedText: str, userId: str, operation: Literal["$inc", "$dec"]
) -> bool:
    """
    Adjusts the user's storage usage based on the extracted text's size and the specified operation.

    Args:
        extractedText (str): The extracted text whose storage impact is being calculated.
        userId (str): The ID of the user whose storage is being updated.
        operation (Literal["$inc", "$dec"]): The operation to perform on the storage usage; either
                                             increase ("$inc") or decrease ("$dec").

    Returns:
        bool: True if the storage was successfully updated, False otherwise.

    Raises:
        HTTPException: If the user is not found or the storage limit is exceeded.
    """
    try:
        if operation not in ("$inc", "$dec"):
            raise ValueError("Invalid operation. Must be '$inc' or '$dec'.")

        size_of_text = len(extractedText.encode("utf-8"))
        user = Users.find_one({"id": userId})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        plan = user.get("subscription_plan", "free")
        storage_used = user.get("storage_used", 0)
        storage_limit = STORAGE_LIMITS_BYTES.get(plan, STORAGE_LIMITS_BYTES["free"])

        if operation == "$inc" and storage_used + size_of_text > storage_limit:
            raise HTTPException(status_code=400, detail="Storage limit exceeded")
        elif operation == "$dec" and storage_used - size_of_text < 0:
            raise HTTPException(
                status_code=400, detail="Storage used cannot be negative."
            )

        Users.update_one(
            {"id": userId},
            {
                "$inc": {
                    "storage_used": (
                        size_of_text if operation == "$inc" else -size_of_text
                    )
                },
                "$set": {"updated_at": datetime.now(UTC)},
            },
        )
        logger.info(
            f"Updated file storage for user {userId}: calculated size of text- {math.ceil(size_of_text / 1024)} KB -> new storage used- {(storage_used + size_of_text) // 1024 if operation == '$inc' else (storage_used - size_of_text) // 1024} KB"
        )
        return True

    except Exception as e:
        logger.error(f"Error updating storage for user {userId}: {str(e)}")
        return False


def handleFileStorage(
    fileSizeBytes: int, userId: str, operation: Literal["$inc", "$dec"]
) -> bool:
    """
    Adjusts the user's storage usage based on the file size and the specified operation.

    Args:
        fileSizeBytes (int): The size of the file in bytes.
        userId (str): The ID of the user whose storage is being updated.
        operation (Literal["$inc", "$dec"]): The operation to perform on the storage usage.

    Returns:
        bool: True if the storage was successfully updated, False otherwise.

    Raises:
        HTTPException: If the user is not found, the storage limit is exceeded, or an invalid operation is provided.
    """
    try:
        if operation not in ("$inc", "$dec"):
            raise ValueError("Invalid operation. Must be '$inc' or '$dec'.")

        user = Users.find_one({"id": userId})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        plan = user.get("subscription_plan", "free")
        storageUsed = user.get("storage_used", 0)
        storageLimit = STORAGE_LIMITS_BYTES.get(plan, STORAGE_LIMITS_BYTES["free"])

        if operation == "$inc" and storageUsed + fileSizeBytes > storageLimit:
            raise HTTPException(status_code=400, detail="Storage limit exceeded")
        elif operation == "$dec" and storageUsed - fileSizeBytes < 0:
            raise HTTPException(
                status_code=400, detail="Storage used cannot be negative."
            )

        Users.update_one(
            {"id": userId},
            {
                "$inc": {
                    "storage_used": (
                        fileSizeBytes if operation == "$inc" else -fileSizeBytes
                    )
                },
                "$set": {"updated_at": datetime.now(UTC)},
            },
        )
        logger.info(
            f"Updated file storage for user {userId}: calculated size of file- {math.ceil(fileSizeBytes / 1024)} KB -> new storage used- {(storageUsed + fileSizeBytes) // 1024 if operation == '$inc' else (storageUsed - fileSizeBytes) // 1024} KB"
        )
        return True

    except Exception as e:
        logger.error(f"Error updating file storage for user {userId}: {str(e)}")
        return False


def handleEmbeddingStorage(
    sizeBytes: int,
    userId: str,
    operation: Literal["$inc", "$dec"],
    chunkCharLength: int = 1100,
    vectorDim: int = 1024,
) -> bool:
    """
    Updates a user's storage usage based on the extracted text and the user's current plan.

    Args:
        extractedText (str): The extracted text whose storage impact is being calculated.
        userId (str): The ID of the user whose storage is being updated.
        operation (Literal["$inc", "$dec"]): The operation to perform on the storage usage.
        chunkCharLength (int): The length of each chunk of text to be embedded in a vector.
        vectorDim (int): The dimension of each vector in the embedding.

    Returns:
        bool: True if the storage was successfully updated, False otherwise.

    Raises:
        HTTPException: If the user is not found, the storage limit is exceeded, or an invalid operation is provided.
    """
    try:
        if operation not in ("$inc", "$dec"):
            raise ValueError("Invalid operation. Must be '$inc' or '$dec'.")

        user = Users.find_one({"id": userId})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        plan = user.get("subscription_plan", "free")
        storageUsed = user.get("storage_used", 0)
        storageLimit = STORAGE_LIMITS_BYTES.get(plan, STORAGE_LIMITS_BYTES["free"])

        bytesPerFloat32 = 4
        bytesPerVector = vectorDim * bytesPerFloat32

        numVectors = math.ceil(sizeBytes / chunkCharLength)
        vectorStorageBytes = numVectors * bytesPerVector

        if operation == "$inc" and storageUsed + vectorStorageBytes > storageLimit:
            raise HTTPException(status_code=400, detail="Storage limit exceeded")
        elif operation == "$dec" and storageUsed - vectorStorageBytes < 0:
            raise HTTPException(
                status_code=400, detail="Storage used cannot be negative."
            )

        Users.update_one(
            {"id": userId},
            {
                "$inc": {
                    "storage_used": (
                        vectorStorageBytes
                        if operation == "$inc"
                        else -vectorStorageBytes
                    )
                },
                "$set": {"updated_at": datetime.now(UTC)},
            },
        )
        logger.info(
            f"Updated file storage for user {userId}: calculated size of embeddings- {math.ceil(vectorStorageBytes / 1024)} KB -> new storage used- {(storageUsed + vectorStorageBytes) // 1024 if operation == '$inc' else (storageUsed - vectorStorageBytes) // 1024} KB"
        )
        return True

    except Exception as e:
        logger.error(f"Error updating embedding storage for user {userId}: {str(e)}")
        return False
