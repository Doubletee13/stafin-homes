from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.contact import Contact
from app.models.property import Property
from app.schemas.contact import ContactCreate
from fastapi import HTTPException, status


def create_contact(db: Session, contact_data: ContactCreate):
    # Verify property exists
    prop = db.get(Property, contact_data.property_id)
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {contact_data.property_id} not found"
        )
    
    db_contact = Contact(**contact_data.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


def get_all_contacts(db: Session, skip: int = 0, limit: int = 100):
    query = select(Contact).order_by(desc(Contact.created_at)).offset(skip).limit(limit)
    result = db.execute(query)
    return result.scalars().all()
