from pydantic import BaseModel
from typing import List, Optional

class ChatHistoryMessage(BaseModel):
    role: str  # "user" or "ai"
    text: str

class ChatbotRequest(BaseModel):
    message: str
    history: Optional[List[ChatHistoryMessage]] = []

class ChatbotResponse(BaseModel):
    response: str
