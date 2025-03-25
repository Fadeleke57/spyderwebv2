from fastapi import APIRouter, Depends
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends
import uuid
from pytz import UTC
from src.utils.exceptions import check_user
from datetime import datetime, timedelta
from src.models.process import Processes, Process
from fastapi.exceptions import HTTPException
from src.lib.logger.index import logger

router = APIRouter()


@router.get("/all/{web_id}")
def get_all_processes(web_id: str, user=Depends(manager)) -> dict[str, list[Process]]:
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
    check_user(user)

    process = Processes.find_one({"jobId": job_id}, {"_id": 0})

    if not process:
        logger.info(f"Process {job_id} not found")
        raise HTTPException(status_code=404, detail="Process not found")

    return {"result": process}
