from fastapi import APIRouter, HTTPException, Depends
from src.db.neo4j import client as neo4j_client
from src.models.index import User
from src.routes.auth.utils import manager
from src.lib.logger.index import logger
from src.models.index import Webs, Contributers, Contributor

router = APIRouter()


@router.get("/all/{web_id}")
def get_all_contributors_for_web(web_id: str, user: User = Depends(manager.required)):
    try:
        web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail=f"Web not found!")

        contributors = Contributers.find({"webId": web_id})
        return {"result": contributors}

    except Exception as e:
        logger.error(f"Error getting contributors: {e}")
        raise HTTPException(status_code=500, detail=str(e))
