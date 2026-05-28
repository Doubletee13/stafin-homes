from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=5, max_length=50)
    message: str = Field(..., min_length=1, max_length=2000)
    property_id: int


class ContactCreate(ContactBase):
    pass


class PropertyBasics(BaseModel):
    id: int
    title: str
    location: str

    class Config:
        from_attributes = True


class ContactResponse(ContactBase):
    id: int
    created_at: datetime
    # Optionally include linked property summary
    property: Optional[PropertyBasics] = None

    class Config:
        from_attributes = True
