from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.router import router

app = FastAPI(title="Stafin Homes API")

# Configure CORS for frontend integration
# Read from environment variable, default to localhost for development
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
