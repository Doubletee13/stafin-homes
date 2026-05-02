from fastapi import APIRouter

from app.api.endpoints import auth, health, property_routes

router = APIRouter()

router.include_router(auth.router)
router.include_router(health.router, tags=["health"])
router.include_router(property_routes.router)
