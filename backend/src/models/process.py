from pydantic import BaseModel
from typing import Optional
from typing_extensions import TypedDict
from datetime import datetime
from src.db.mongodb import get_collection
from typing import Literal
from uuid import uuid4
from pytz import UTC
from src.lib.logger.index import logger
from fastapi import HTTPException


Processes = get_collection("processes")


class Process(BaseModel):
    jobId: str
    status: Literal["pending", "processing", "completed", "failed"]
    webId: str
    type: Literal["upload", "embed", "connect"]
    percentage: float
    description: str
    created: datetime
    updated: datetime
    error: Optional[str]
    closeModal: Optional[bool]


def create_process(web_id: str, type: str, description: str) -> str:
    """
    Creates a new process in the database.

    Args:
        web_id (str): The ID of the web that the process is related to.
        type (str): The type of the process, e.g. "upload", "embed", "connect".
        description (str): A description of the process.

    Returns:
        str: The ID of the new process.

    Raises:
        HTTPException: If the process cannot be created, e.g. due to a database error.
    """
    jobId = str(uuid4())
    process: Process = {
        "jobId": jobId,
        "status": "pending",
        "webId": web_id,
        "type": type,
        "percentage": 0,
        "description": description,
        "created": datetime.now(UTC),
        "updated": datetime.now(UTC),
        "error": None,
        "closeModal": None,
    }

    try:
        Processes.insert_one(process)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

    return jobId


def update_process(
    job_id: str,
    status: Literal["pending", "processing", "completed", "failed"],
    percentage: float,
    error: Optional[str] = None,
    closeModal: Optional[bool] = None,
):
    """
    Updates the status of a process in the database.

    Args:
        job_id (str): The ID of the process to update.
        status (str): The new status of the process, one of "pending", "processing", "completed", "failed".
        percentage (float): The new percentage of the process, between 0 and 100.
        error (str, optional): An error message if the process failed.

    Raises:
        HTTPException: If the process cannot be updated, e.g. due to a database error.
    """
    if percentage > 100:
        percentage = 100
    elif percentage < 0:
        percentage = 0

    try:
        Processes.find_one_and_update(
            {"jobId": job_id},
            {
                "$set": {
                    "status": status,
                    "percentage": percentage,
                    "updated": datetime.now(UTC),
                    "error": error,
                    "closeModal": closeModal,
                }
            },
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))
