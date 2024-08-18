from fastapi import APIRouter, Depends, HTTPException
from src.db.neo4j import driver as neo4j_driver, run_query
from src.routes.auth.oauth2 import manager
from src.routes.graph.queries import queries
import logging

router = APIRouter()

@router.get("/articles/{limit}")
def read_neo4j_data(limit: int, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = run_query(f"{queries['GET_ALL_ARTICLES']} LIMIT {limit}")
    return {"result": result}

@router.get("/article/{article_id}")
def get_article_by_id(article_id: str, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': article_id})
    return {"result": result}

@router.get("/articles/q?{query}")
def get_articles_by_query(query: str, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = run_query(queries["GET_ARTICLE_BY_HEADER"], {'header': query})
    return {"result": result}