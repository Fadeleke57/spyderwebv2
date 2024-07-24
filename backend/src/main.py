from fastapi import FastAPI
from backend.src.api.v1.endpoints import articles

app = FastAPI()

app.include_router(articles.router, prefix="/article", tags=["article"])
