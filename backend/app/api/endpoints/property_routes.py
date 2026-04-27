from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from app.services import property_service

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("/", response_model=PropertyResponse, status_code=201)
def create(data: PropertyCreate, db: Session = Depends(get_db)):
    return property_service.create_property(db, data)


@router.get("/", response_model=List[PropertyResponse])
def get_all(
    location: str = None,
    property_type: str = None,
    min_price: float = None,
    max_price: float = None,
    bedrooms: int = None,
    db: Session = Depends(get_db),
):
    return property_service.get_all_properties(
        db,
        location=location,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
    )


@router.get("/{property_id}", response_model=PropertyResponse)
def get_one(property_id: int, db: Session = Depends(get_db)):
    return property_service.get_property_by_id(db, property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
def update(property_id: int, data: PropertyUpdate, db: Session = Depends(get_db)):
    return property_service.update_property(db, property_id, data)


@router.delete("/{property_id}")
def delete(property_id: int, db: Session = Depends(get_db)):
    return property_service.delete_property(db, property_id)
