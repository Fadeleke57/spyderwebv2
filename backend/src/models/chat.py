from pydantic import BaseModel
from typing import Optional, List, Any
from enum import Enum


class ClientAttachment(BaseModel):
    name: str
    contentType: str
    url: str


class ToolInvocationState(str, Enum):
    CALL = "call"
    PARTIAL_CALL = "partial-call"
    RESULT = "result"


class ToolInvocation(BaseModel):
    state: ToolInvocationState
    toolCallId: str
    toolName: str
    args: Any
    result: Any


class ClientMessage(BaseModel):
    role: str
    content: str
    experimental_attachments: Optional[List[ClientAttachment]] = None
    toolInvocations: Optional[List[ToolInvocation]] = None


class Request(BaseModel):
    messages: List[ClientMessage]
