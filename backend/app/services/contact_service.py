from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.contact import Contact
from app.models.property import Property
from app.schemas.contact import ContactCreate
from fastapi import HTTPException, status
from app.services import sendgrid_service
from app.core.config import SENDGRID_ADMIN_EMAIL
import logging

logger = logging.getLogger(__name__)


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
    
    # Send email notification (non-blocking)
    try:
        email_sent = sendgrid_service.send_inquiry_email(
            contact_name=contact_data.name,
            contact_phone=contact_data.phone,
            contact_message=contact_data.message,
            property_title=prop.title,
            property_location=prop.location,
            property_price=prop.price,
            recipient_email=SENDGRID_ADMIN_EMAIL
        )
        
        if email_sent:
            logger.info(f"Email notification sent for contact ID {db_contact.id}")
        else:
            logger.warning(f"Failed to send email notification for contact ID {db_contact.id}")
            
    except Exception as e:
        # Log error but don't fail the contact creation
        logger.error(f"Error sending email notification for contact ID {db_contact.id}: {str(e)}")
    
    return db_contact


def get_all_contacts(db: Session, skip: int = 0, limit: int = 100):
    query = select(Contact).order_by(desc(Contact.created_at)).offset(skip).limit(limit)
    result = db.execute(query)
    return result.scalars().all()
