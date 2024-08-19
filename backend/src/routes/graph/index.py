from fastapi import APIRouter, Depends, HTTPException, Query
from src.db.neo4j import driver as neo4j_driver, run_query
from src.routes.auth.oauth2 import manager
from src.routes.graph.queries import queries
import logging

router = APIRouter()

@router.get("/articles/")
def get_articles(limit: int = 10, query: str = None, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")

    if query:
        result = run_query(f"{queries['GET_ARTICLE_BY_TEXT']} LIMIT {limit}", {'text': query})
    else:
        result = run_query(f"{queries['GET_ALL_ARTICLES']} LIMIT {limit}")

    return {"result": result}

@router.get("/article/{article_id}")
def get_article_by_id(article_id: str, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': article_id})
    return {"result": result}