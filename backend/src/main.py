import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.index import lifespan
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.jobs.credit_reset import reset_monthly_credits
from src.routes.index import (
    auth_router,
    user_router,
    webs_router,
    sources_router,
    connections_router,
    chat_router,
    process_router,
    payment_router,
)

logging.basicConfig(level=logging.ERROR)

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://spyderweb.vercel.app",
    "https://www.spydr.dev",
    "https://spydr.dev",
    "https://api.spydr.dev",
    "https://vercel.spydr.dev",
    "https://spydrweb-git-feature-farouk-adelekes-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/users")
app.include_router(webs_router, prefix="/webs")
app.include_router(sources_router, prefix="/sources")
app.include_router(connections_router, prefix="/connections")
app.include_router(chat_router, prefix="/chat")
app.include_router(process_router, prefix="/processes")
app.include_router(payment_router, prefix="/payment")

# Initialize scheduler
scheduler = AsyncIOScheduler()

# Schedule credit reset job to run daily (it will only reset credits for users who haven't been reset in a month)
scheduler.add_job(reset_monthly_credits, "interval", days=1)


# Start the scheduler when the app starts
@app.on_event("startup")
async def start_scheduler():
    scheduler.start()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Web!"}


@app.get("/health")
def health():
    return {"status": "ok"}
