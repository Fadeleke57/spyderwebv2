import logging
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.db.index import lifespan
from src.utils.credits import reset_user_credits
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

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start up
    background_tasks = BackgroundTasks()
    background_tasks.add_task(check_and_reset_credits)
    yield
    # Shut down

async def check_and_reset_credits():
    """Check and reset credits for users daily"""
    from src.models.user import Users
    from datetime import datetime, timedelta
    from pytz import UTC
    from src.lib.logger.index import logger
    
    try:
        now = datetime.now(UTC)
        
        # Find users who need credit reset
        users_to_reset = Users.find({
            "$or": [
                # Monthly users who haven't been reset in 30 days
                {
                    "is_yearly": False,
                    "last_credits_reset": {
                        "$lte": now - timedelta(days=30)
                    }
                },
                # Yearly users who haven't been reset in 365 days
                {
                    "is_yearly": True,
                    "last_credits_reset": {
                        "$lte": now - timedelta(days=365)
                    }
                }
            ]
        })
        
        async for user in users_to_reset:
            try:
                await reset_user_credits(user["id"])
                logger.info(f"Reset credits for user {user['id']}")
            except Exception as e:
                logger.error(f"Failed to reset credits for user {user['id']}: {str(e)}")
                
    except Exception as e:
        logger.error(f"Error in credit reset task: {str(e)}")

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

# Add all routers
app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/users")
app.include_router(webs_router, prefix="/webs")
app.include_router(sources_router, prefix="/sources")
app.include_router(connections_router, prefix="/connections")
app.include_router(chat_router, prefix="/chat")
app.include_router(process_router, prefix="/processes")
app.include_router(payment_router, prefix="/payment")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Web!"}

@app.get("/health")
def health():
    return {"status": "ok"}
