from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="ECC AI Recommendation Service",
    description="API for mining behavior, seasonal recommendations, and Top-K items using Implicit ALS.",
    version="1.0.0"
)

class RecommendationRequest(BaseModel):
    user_id: int
    top_k: int = 5
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    season: Optional[str] = None

class RecommendedItem(BaseModel):
    item_id: int
    score: float
    reason: str

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "ECC AI Recommendation Core"}

@app.post("/recommend/top-k", response_model=List[RecommendedItem])
def recommend_top_k(request: RecommendationRequest):
    # Simulated response for ALS recommendation model
    # In production, this will load the trained Implicit ALS model, query similarity matrix, and filter by season/location.
    try:
        dummy_recommendations = [
            RecommendedItem(item_id=101, score=0.95, reason="Gợi ý dựa trên hành vi mua sắm tương tự"),
            RecommendedItem(item_id=202, score=0.88, reason="Sản phẩm đang trong mùa vụ thu hoạch tại địa phương của bạn"),
            RecommendedItem(item_id=303, score=0.74, reason="Sản phẩm phổ biến gần vị trí của bạn")
        ]
        return dummy_recommendations[:request.top_k]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
