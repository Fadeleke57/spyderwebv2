from fastapi import APIRouter, Depends, HTTPException
from src.db.neo4j import driver as neo4j_driver, run_query
from src.routes.auth.oauth2 import manager
import logging

router = APIRouter()

@router.get("/articles/{limit}")
def read_neo4j_data(limit: int = 20, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    query = f'MATCH (n) RETURN n LIMIT {limit}'
    result = run_query(query)
    return {"result": result}