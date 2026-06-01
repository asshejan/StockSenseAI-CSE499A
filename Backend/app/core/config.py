import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "StockSenseAI Backend"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
