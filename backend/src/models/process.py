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
    sourceId: Optional[str]
    type: Literal["upload", "embed", "connect", "autolink"]
    percentage: float
    description: str
    created: datetime
    updated: datetime
    error: Optional[str]
    closeModal: Optional[bool]


def create_process(
    web_id: str, type: str, description: str, source_id: Optional[str] = None
) -> str:
    """
    Create a new process in the database.

    Args:
        web_id (str): The ID of the web (web) the process belongs to.
        type (str): The type of process (upload, embed, connect, autolink).
        description (str): A description of the process.
        source_id (str): The ID of the source the process is associated with.

    Returns:
        str: The ID of the newly created process.
    """
    jobId = str(uuid4())
    process: Process = {
        "jobId": jobId,
        "status": "pending",
        "webId": web_id,
        "sourceId": source_id,
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
    description: Optional[str] = None,
    source_id: Optional[str] = None,
    error: Optional[str] = None,
    closeModal: Optional[bool] = None,
):
    """
    Update the status and metadata of an existing process.

    Args:
        job_id (str): The ID of the process to update.
        status (Literal["pending", "processing", "completed", "failed"]): The current status of the process.
        percentage (float): The completion percentage of the process. Values are clamped between 0 and 100.
        description (Optional[str]): An optional description of the process update.
        source_id (Optional[str]): An optional ID of a related source.
        error (Optional[str]): An optional error message if the process failed.
        closeModal (Optional[bool]): An optional flag indicating if the modal should be closed.

    Raises:
        HTTPException: If the update fails due to a database error.
    """

    if percentage > 100:
        percentage = 100
    elif percentage < 0:
        percentage = 0

    updates = {"status": status, "percentage": percentage, "updated": datetime.now(UTC)}

    if description:
        updates["description"] = description

    if source_id:
        updates["sourceId"] = source_id

    if error:
        updates["error"] = error

    if closeModal:
        updates["closeModal"] = closeModal

    try:
        Processes.find_one_and_update(
            {"jobId": job_id},
            {"$set": updates},
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))
