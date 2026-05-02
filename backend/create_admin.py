"""
Script to create an initial admin user
Run this script from the backend directory: python create_admin.py
"""
import sys
import getpass
from sqlalchemy.orm import Session

# Add parent directory to path for imports
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.schemas.auth import AdminCreate
from app.services.auth_service import create_admin, get_admin_by_email


def create_initial_admin():
    """Create an initial admin user interactively"""
    print("\n=== Create Initial Admin User ===\n")
    
    email = input("Enter admin email: ").strip()
    if not email:
        print("Error: Email is required")
        return False
    
    # Check if admin already exists
    db = SessionLocal()
    try:
        existing_admin = get_admin_by_email(db, email)
        if existing_admin:
            print(f"Error: Admin with email '{email}' already exists")
            return False
    finally:
        db.close()
    
    password = getpass.getpass("Enter admin password: ")
    if len(password) < 6:
        print("Error: Password must be at least 6 characters")
        return False
    
    confirm_password = getpass.getpass("Confirm admin password: ")
    if password != confirm_password:
        print("Error: Passwords do not match")
        return False
    
    # Create admin
    db = SessionLocal()
    try:
        admin_data = AdminCreate(email=email, password=password)
        admin = create_admin(db, admin_data)
        print(f"\n✓ Admin user created successfully!")
        print(f"  Email: {admin.email}")
        print(f"  ID: {admin.id}")
        return True
    except Exception as e:
        print(f"\n✗ Error creating admin: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = create_initial_admin()
    sys.exit(0 if success else 1)
