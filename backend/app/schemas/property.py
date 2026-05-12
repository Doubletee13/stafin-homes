from datetime import datetime
from typing import List, Literal, Optional, Union

from pydantic import BaseModel, Field, field_validator, model_validator


class MediaItem(BaseModel):
    """Represents a single media item (image or video)."""
    type: Literal["image", "video"]
    url: str = Field(..., min_length=1)
    featured: Optional[bool] = False

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError(f"Invalid URL (must start with http:// or https://): {v}")
        return v


class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    location: str = Field(..., min_length=1, max_length=255)
    property_type: str = Field(..., pattern="^(sale|rent|shortlet)$")
    bedrooms: int = Field(0, ge=0)
    bathrooms: int = Field(0, ge=0)
    # New unified media field
    media: Optional[List[MediaItem]] = []

    @model_validator(mode="before")
    @classmethod
    def handle_backward_compat(cls, values):
        """Accept old image_urls format and convert it to media[]."""
        if isinstance(values, dict):
            image_urls = values.pop("image_urls", None)
            if image_urls and not values.get("media"):
                values["media"] = [{"type": "image", "url": url} for url in image_urls if url]
        return values


class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    property_type: Optional[str] = Field(None, pattern="^(sale|rent|shortlet)$")
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    media: Optional[List[MediaItem]] = None

    @model_validator(mode="before")
    @classmethod
    def handle_backward_compat(cls, values):
        """Accept old image_urls format and convert it to media[]."""
        if isinstance(values, dict):
            image_urls = values.pop("image_urls", None)
            if image_urls is not None and values.get("media") is None:
                values["media"] = [{"type": "image", "url": url} for url in image_urls if url]
        return values


class PropertyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    location: str
    property_type: str
    bedrooms: int
    bathrooms: int
    media: Optional[List[MediaItem]] = []
    created_at: datetime

    class Config:
        from_attributes = True
