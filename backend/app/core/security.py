"""
Security utilities for password hashing and JWT token management
"""
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext

from app.core.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
ALGORITHM = "HS256"


class TokenError(Exception):
    """Base exception for token errors"""
    pass


class TokenExpiredError(TokenError):
    """Token has expired"""
    pass


class TokenInvalidError(TokenError):
    """Token is invalid"""
    pass


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a plain password using bcrypt
    
    Args:
        password: The plain text password to hash
        
    Returns:
        The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: The data to encode in the token (typically includes 'sub' for subject)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token as a string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token
    
    Args:
        token: The JWT token to decode
        
    Returns:
        Decoded token payload if valid
        
    Raises:
        TokenExpiredError: If token has expired
        TokenInvalidError: If token is invalid or malformed
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise TokenExpiredError("Token has expired")
    except JWTError:
        raise TokenInvalidError("Invalid token")


def validate_secret_key() -> None:
    """
    Validate that SECRET_KEY is properly configured
    
    Raises:
        ValueError: If SECRET_KEY is missing, too short, or uses default value
    """
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in environment variables")
    
    if SECRET_KEY == "your-secret-key-change-in-production":
        raise ValueError("SECRET_KEY must be changed from default value")
    
    if len(SECRET_KEY) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters long")
