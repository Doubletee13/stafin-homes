from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    location: str = Field(..., min_length=1, max_length=255)
    property_type: str = Field(..., pattern="^(sale|rent|shortlet)$")
    bedrooms: int = Field(0, ge=0)
    bathrooms: int = Field(0, ge=0)
    image_urls: Optional[List[str]] = []


class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    property_type: Optional[str] = Field(None, pattern="^(sale|rent|shortlet)$")
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    image_urls: Optional[List[str]] = None


class PropertyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    location: str
    property_type: str
    bedrooms: int
    bathrooms: int
    image_urls: Optional[List[str]]
    created_at: datetime

    class Config:
        from_attributes = True
