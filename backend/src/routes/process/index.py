from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
from uuid import uuid4
from pytz import UTC
from src.utils.exceptions import check_user
from datetime import datetime, timedelta
from src.models.index import Processes, Process
from fastapi.exceptions import HTTPException
from src.lib.logger.index import logger

router = APIRouter()


@router.get("/all/{web_id}")
def get_all_processes(web_id: str, user=Depends(manager)) -> dict[str, list[Process]]:
    """
    Retrieve all processes associated with a given web ID, within the last minute.

    Args:
        web_id (str): The ID of the web (web) to retrieve processes from.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing a list of processes associated with the given web ID.

    Raises:
        HTTPException: If the web is not found, raises a 404 error.
    """
    check_user(user)

    # get all processes from the last minute
    web_processes = (
        Processes.find(
            {
                "webId": web_id,
                "updated": {"$gt": datetime.now(UTC) - timedelta(minutes=1)},
            },
            {"_id": 0},
        )
        or []
    )

    return {"result": list(web_processes)}


@router.get("/process/{job_id}")
def get_process(job_id: str, user=Depends(manager)) -> Process:
    """
    Retrieve a process by its ID.

    Args:
        job_id (str): The ID of the process to retrieve.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the requested process.

    Raises:
        HTTPException: If the process is not found, raises a 404 error.
    """
    check_user(user)

    process = Processes.find_one({"jobId": job_id}, {"_id": 0})

    if not process:
        logger.info(f"Process {job_id} not found")
        raise HTTPException(status_code=404, detail="Process not found")

    return {"result": process}

@router.get("/status/{web_id}/{source_id}")
def get_status(web_id: str, source_id: str, user=Depends(manager)):
    check_user(user)
    process = Processes.find_one(
        {
            "sourceId": source_id, 
            "status": {"$in": ["processing"]}
        }, 
        {"_id": 0}
    ) or None
    logger.info(f"Process {source_id} status: {process}")
    return {"result": process}
