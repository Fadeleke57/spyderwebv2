from pytz import UTC
from fastapi import APIRouter, Depends, FastAPI, Query
from fastapi.responses import StreamingResponse
from src.routes.auth.oauth2 import manager
from src.utils.exceptions import check_user
from src.lib.logger.index import logger
from src.utils.chat.prompt import ClientMessage, convert_to_openai_messages, stream_text
from src.models.index import Request

router = APIRouter()


@router.post("/")
async def handle_chat_data(
    request: Request, protocol: str = Query("data")
):  # will need to configure vercel ai sdk headers to include user session token

    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    response = StreamingResponse(stream_text(openai_messages, protocol))
    response.headers["x-vercel-ai-data-stream"] = "v1"
    return response
