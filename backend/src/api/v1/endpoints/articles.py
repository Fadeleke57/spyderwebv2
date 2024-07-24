from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from src import crud, schemas
from src.db.session import get_db

router = APIRouter()

@router.get("/", response_model=schemas.Article)
def get_article():
    pass

