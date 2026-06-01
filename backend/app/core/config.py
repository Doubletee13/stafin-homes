import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

# Supabase Storage configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "STAFIN Homes")
SENDGRID_ADMIN_EMAIL = os.getenv("SENDGRID_ADMIN_EMAIL", "admin@stafinhomes.com")

# External APIs configuration
NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY")

def validate_security_config() -> None:
    """
    Validate security configuration on application startup
    
    Raises:
        ValueError: If security configuration is invalid
    """
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in environment variables")
    
    if SECRET_KEY == "your-secret-key-change-in-production":
        raise ValueError("SECRET_KEY must be changed from default value")
    
    if len(SECRET_KEY) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters long")
