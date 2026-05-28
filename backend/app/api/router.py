from fastapi import APIRouter

from app.api.endpoints import auth, health, property_routes, media, contact_routes

router = APIRouter()

router.include_router(auth.router)
router.include_router(health.router, tags=["health"])
router.include_router(property_routes.router)
router.include_router(media.router)
router.include_router(contact_routes.router)
