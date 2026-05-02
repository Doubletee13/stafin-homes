from pydantic import BaseModel, EmailStr, Field


class AdminLogin(BaseModel):
    """Schema for admin login request"""
    email: EmailStr
    password: str = Field(..., min_length=1)


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str


class AdminCreate(BaseModel):
    """Schema for creating an admin user"""
    email: EmailStr
    password: str = Field(..., min_length=6)
