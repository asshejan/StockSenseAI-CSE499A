from fastapi import APIRouter
from app.api.routes import stocks, chatbot

api_router = APIRouter()

api_router.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
