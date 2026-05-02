from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.admin import Admin
from app.schemas.auth import AdminCreate


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    """
    Authenticate an admin by email and password
    
    Args:
        db: Database session
        email: Admin email
        password: Plain text password
        
    Returns:
        Admin object if authentication successful, None otherwise
    """
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    if not admin.is_active:
        return None
    return admin


def create_admin_token(admin: Admin) -> str:
    """
    Create a JWT access token for an admin
    
    Args:
        admin: Admin object
        
    Returns:
        JWT access token string
    """
    token_data = {"sub": str(admin.id)}
    return create_access_token(token_data)


def create_admin(db: Session, admin_data: AdminCreate) -> Admin:
    """
    Create a new admin user
    
    Args:
        db: Database session
        admin_data: Admin creation data
        
    Returns:
        Created Admin object
    """
    hashed_password = get_password_hash(admin_data.password)
    admin = Admin(
        email=admin_data.email,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def get_admin_by_id(db: Session, admin_id: int) -> Admin | None:
    """
    Get an admin by ID
    
    Args:
        db: Database session
        admin_id: Admin ID
        
    Returns:
        Admin object if found, None otherwise
    """
    return db.query(Admin).filter(Admin.id == admin_id).first()


def get_admin_by_email(db: Session, email: str) -> Admin | None:
    """
    Get an admin by email
    
    Args:
        db: Database session
        email: Admin email
        
    Returns:
        Admin object if found, None otherwise
    """
    return db.query(Admin).filter(Admin.email == email).first()
