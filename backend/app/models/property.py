import enum

from sqlalchemy import Column, Integer, String, Text, Float, Enum, JSON, DateTime, func
from sqlalchemy.orm import relationship

from app.models.base import Base


class PropertyType(str, enum.Enum):
    sale = "sale"
    rent = "rent"
    shortlet = "shortlet"


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    property_type = Column(Enum(PropertyType), nullable=False, index=True)
    bedrooms = Column(Integer, nullable=False, default=0)
    bathrooms = Column(Integer, nullable=False, default=0)
    # Unified media column: list of {"type": "image"|"video", "url": "..."} objects
    media = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    contacts = relationship("Contact", back_populates="property", cascade="all, delete-orphan")
