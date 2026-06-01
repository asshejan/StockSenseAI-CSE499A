from pydantic import BaseModel
from typing import Optional

class StockResponse(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    high: float
    low: float
    volume: str
    timestamp: str

class StockHistoryPoint(BaseModel):
    date: str
    close: float
    open: float
    high: float
    low: float
    volume: int
