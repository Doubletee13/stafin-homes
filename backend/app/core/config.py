import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "mysql")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "stafin_db")
DB_USER = os.getenv("DB_USER", "stafin_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "stafin_pass")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


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
