from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.schemas.stock import StockResponse, StockHistoryPoint
from app.services.dse_service import DSEService

router = APIRouter()

@router.get("/live", response_model=List[StockResponse])
def get_live_dse_stocks():
    """
    Get live real-time stock prices and indicators of major Dhaka Stock Exchange (DSE) listings.
    """
    try:
        data = DSEService.get_live_dse_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch DSE live data: {str(e)}")

@router.get("/history/{symbol}", response_model=List[StockHistoryPoint])
def get_stock_price_history(symbol: str, days: int = Query(default=30, ge=5, le=365)):
    """
    Get historical stock close, open, high, low, and volume data for a specific stock symbol.
    """
    try:
        history = DSEService.get_stock_history(symbol, days)
        if not history:
            raise HTTPException(status_code=404, detail=f"No history found for stock symbol {symbol}")
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock history: {str(e)}")
