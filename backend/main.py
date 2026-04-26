from fastapi import FastAPI

from app.api.router import router

app = FastAPI(title="Stafin Homes API")

app.include_router(router)
