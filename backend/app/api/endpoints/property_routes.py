from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.admin import Admin
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse, PropertyListResponse
from app.services import property_service

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("/", response_model=PropertyResponse, status_code=201)
def create(
    data: PropertyCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return property_service.create_property(db, data)


@router.get("/", response_model=PropertyListResponse)
def get_all(
    # Existing filters (preserved, backward-compatible)
    location: str = None,
    property_type: str = None,
    min_price: float = None,
    max_price: float = None,
    bedrooms: int = None,
    # New filters (Issue #13)
    keyword: str = Query(None, description="Search title and description"),
    bathrooms: int = Query(None, ge=0, description="Minimum bathrooms"),
    sort: str = Query(None, description="Sort order: newest, oldest, price_asc, price_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(9, ge=1, le=100, description="Maximum records to return"),
    db: Session = Depends(get_db),
):
    return property_service.get_all_properties(
        db,
        location=location,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        keyword=keyword,
        bathrooms=bathrooms,
        sort=sort,
        page=page,
        limit=limit,
    )


@router.get("/{property_id}", response_model=PropertyResponse)
def get_one(property_id: int, db: Session = Depends(get_db)):
    return property_service.get_property_by_id(db, property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
def update(
    property_id: int,
    data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return property_service.update_property(db, property_id, data)


@router.delete("/{property_id}")
def delete(
    property_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return property_service.delete_property(db, property_id)
