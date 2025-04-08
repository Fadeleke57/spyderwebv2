from pytz import UTC
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from src.routes.auth.oauth2 import manager
from src.utils.exceptions import check_user
from src.lib.logger.index import logger
from src.lib.openai.index import client as openaiClient
from src.utils.chat.prompt import convert_to_openai_messages, stream_text
from src.models.index import Request, User, Chats

router = APIRouter()


@router.post("/configure/{webId}")
def configure_chat(webId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        openaiClient.configure(webId=webId)
        return {"result": True}
    except Exception as e:
        logger.error(f"Error configuring chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")  # handle query
async def handle_chat_data(
    request: Request, user: User = Depends(manager), protocol: str = Query("data")
):
    check_user(user)
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    response = StreamingResponse(stream_text(openai_messages, protocol))
    response.headers["x-vercel-ai-data-stream"] = "v1"
    return response


@router.post("/{chatId}/save")
def save_chat(chatId: str, payload: dict, user: User = Depends(manager)):
    check_user(user)
    try:
        messages_to_save = payload.get("messages")

        chat = Chats.find_one({"chatId": chatId, "userId": user["id"]})
        if messages_to_save:
            if chat:
                Chats.update_one(
                    {"chatId": chatId, "userId": user["id"]},
                    {
                        "$set": {
                            "messages": messages_to_save,
                            "updatedAt": datetime.now(UTC),
                        }
                    },
                )
            else:
                Chats.insert_one(
                    {
                        "chatId": chatId,
                        "userId": user["id"],
                        "createdAt": datetime.now(UTC),
                        "updatedAt": datetime.now(UTC),
                        "messages": messages_to_save,
                    }
                )
        return {"result": True}
    except Exception as e:
        logger.error(f"Error saving chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatId}")
def delete_chat(chatId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        Chats.delete_one({"chatId": chatId, "userId": user["id"]})
        return {"result": True}
    except Exception as e:
        logger.error(f"Error deleting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all")
def get_all_chats(user: User = Depends(manager)):
    check_user(user)
    try:
        chats = (
            list(Chats.find({"userId": user["id"]}, {"_id": 0}).sort("updatedAt", -1))
            or []
        )
        return {"result": chats}
    except Exception as e:
        logger.error(f"Error getting all chats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatId}")
def get_chat(chatId: str, user: User = Depends(manager)):
    check_user(user)
    try:
        chat = Chats.find_one({"chatId": chatId}, {"_id": 0})
        return {"result": chat["messages"] if chat else []}
    except Exception as e:
        logger.error(f"Error getting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
