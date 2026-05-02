from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import AdminLogin, Token
from app.services.auth_service import authenticate_admin, create_admin_token

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Authenticate an admin and return a JWT token
    
    Args:
        credentials: Admin login credentials (email and password)
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If authentication fails (invalid credentials or inactive account)
    """
    admin = authenticate_admin(db, credentials.email, credentials.password)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_admin_token(admin)
    
    return {"access_token": access_token, "token_type": "bearer"}
