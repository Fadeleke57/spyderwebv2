from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.index import lifespan
from src.routes.auth.index import router as auth_router
from src.routes.graph.index import router as graph_router
from src.core.config import settings
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(lifespan=lifespan)

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://spyderweb.vercel.app",
    "https://www.spydr.dev",
    "https://spydr.dev",
    "https://api.spydr.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(graph_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SpyderWeb!"}