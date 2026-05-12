from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate

# Whitelist of valid sort options to prevent SQL injection via order_by
SORT_OPTIONS = {
    "newest": Property.created_at.desc(),
    "oldest": Property.created_at.asc(),
    "price_asc": Property.price.asc(),
    "price_desc": Property.price.desc(),
}


def create_property(db: Session, data: PropertyCreate) -> Property:
    db_property = Property(**data.model_dump())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


def get_all_properties(
    db: Session,
    # Existing filters (preserved)
    location: str = None,
    property_type: str = None,
    min_price: float = None,
    max_price: float = None,
    bedrooms: int = None,
    # New filters
    keyword: str = None,
    bathrooms: int = None,
    sort: str = None,
    skip: int = 0,
    limit: int = 20,
) -> dict:
    query = db.query(Property)

    # --- Existing filters (unchanged) ---
    if location:
        query = query.filter(Property.location.ilike(f"%{location}%"))
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms == bedrooms)

    # --- New filters ---
    if keyword:
        search_term = f"%{keyword}%"
        query = query.filter(
            or_(
                Property.title.ilike(search_term),
                Property.description.ilike(search_term),
            )
        )
    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)

    # --- Sorting ---
    sort_clause = SORT_OPTIONS.get(sort, Property.created_at.desc())
    query = query.order_by(sort_clause)

    # --- Count before pagination (for pagination metadata) ---
    total = query.count()

    # --- Pagination ---
    items = query.offset(skip).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


def get_property_by_id(db: Session, property_id: int) -> Property:
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


def update_property(db: Session, property_id: int, data: PropertyUpdate) -> Property:
    db_property = get_property_by_id(db, property_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_property, key, value)
    db.commit()
    db.refresh(db_property)
    return db_property


def delete_property(db: Session, property_id: int) -> dict:
    db_property = get_property_by_id(db, property_id)
    db.delete(db_property)
    db.commit()
    return {"detail": "Property deleted successfully"}
