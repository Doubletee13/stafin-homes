"""
Dependency functions for API routes
"""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    decode_access_token,
    TokenExpiredError,
    TokenInvalidError
)
from app.models.admin import Admin
from app.services.auth_service import get_admin_by_id


def get_current_admin(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Dependency to get the current authenticated admin from JWT token
    
    Args:
        authorization: Authorization header value
        db: Database session
        
    Returns:
        Current authenticated Admin object
        
    Raises:
        HTTPException: If token is missing, invalid, expired, or admin not found
    """
    # Check if Authorization header is present
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validate Authorization scheme
    parts = authorization.split(" ")
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, token = parts
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode and validate token
    try:
        payload = decode_access_token(token)
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except TokenInvalidError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract admin ID from token
    admin_id: str = payload.get("sub")
    if admin_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch admin from database
    admin = get_admin_by_id(db, int(admin_id))
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check admin status
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive admin user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return admin
