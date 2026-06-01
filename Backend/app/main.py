from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API supplying live Dhaka Stock Exchange (DSE) price feeds and BSEC regulatory intelligence.",
    version="1.0.0"
)

# Set up CORS middleware to support local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev/testing. Refine in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "endpoints": {
            "live_stocks": f"{settings.API_V1_STR}/stocks/live",
            "stock_history": f"{settings.API_V1_STR}/stocks/history/{{symbol}}",
            "chatbot": f"{settings.API_V1_STR}/chatbot/query"
        }
    }
