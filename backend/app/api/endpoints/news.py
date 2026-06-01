import httpx
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from app.core.config import NEWSDATA_API_KEY

router = APIRouter()

@router.get("/news/ticker")
async def get_news_ticker() -> Dict[str, Any]:
    """
    Proxy endpoint to fetch real estate news for Nigeria from NewsData.io.
    Avoids exposing the API key to the frontend client.
    """
    if not NEWSDATA_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="NEWSDATA_API_KEY not configured on server"
        )
        
    url = f"https://newsdata.io/api/1/latest?apikey={NEWSDATA_API_KEY}&q=real+estate+nigeria&language=en"
    
    try:
        # Use a short timeout so the frontend fallback triggers quickly if the API hangs
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=8.0)
            
        response.raise_for_status()
        return response.json()
        
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, 
            detail=f"News API returned error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503, 
            detail=f"Failed to connect to News API: {str(e)}"
        )
