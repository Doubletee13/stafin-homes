from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.admin import Admin
from app.schemas.contact import ContactCreate, ContactResponse
from app.services import contact_service

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(data: ContactCreate, db: Session = Depends(get_db)):
    """
    Submit a new property inquiry (Public)
    """
    return contact_service.create_contact(db, data)


@router.get("/", response_model=List[ContactResponse])
def get_inquiries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Retrieve all inquiries (Admin only)
    """
    return contact_service.get_all_contacts(db, skip, limit)
