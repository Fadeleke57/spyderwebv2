from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from src import crud, schemas
from backend.src.db.neo4j import get_db

router = APIRouter()

@router.get("/article", response_model=schemas.Article)
def get_article():
    pass

