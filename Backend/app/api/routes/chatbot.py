from fastapi import APIRouter, HTTPException
from app.schemas.chatbot import ChatbotRequest, ChatbotResponse
from app.services.chatbot_service import ChatbotService

router = APIRouter()

@router.post("/query", response_model=ChatbotResponse)
def query_sense_ai(request: ChatbotRequest):
    """
    Query the SenseAI chat engine. Powered by Gemini, trained on real-time DSE data,
    20 years of stock history, and BSEC capital investment regulations.
    """
    try:
        # Convert Pydantic history objects to standard dictionaries
        history_dicts = [h.model_dump() for h in request.history] if request.history else []
        
        response_text = ChatbotService.get_ai_response(
            user_message=request.message,
            chat_history=history_dicts
        )
        return ChatbotResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI engine error: {str(e)}")
