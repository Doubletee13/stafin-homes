import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Any, Optional
from app.core.config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
import logging

logger = logging.getLogger(__name__)

# Initialize cloudinary
if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )
else:
    logger.warning("Cloudinary environment variables are missing! Uploads will fail.")

def upload_media(file, file_type: str) -> Dict[str, Any]:
    """
    Uploads a file to Cloudinary.
    
    Args:
        file: The file object (spooled temp file from upload).
        file_type: "image" or "video"
        
    Returns:
        A dict matching the frontend's expected format `{"type": file_type, "url": secure_url}`
    """
    if not CLOUDINARY_CLOUD_NAME:
        raise ValueError("Cloudinary is not configured.")

    try:
        # Determine resource type
        resource_type = "video" if file_type == "video" else "image"
        
        # Upload using the cloudinary SDK
        result = cloudinary.uploader.upload(
            file, 
            resource_type=resource_type,
            folder="stafin-homes" # organizing under a folder
        )
        
        return {
            "type": file_type,
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")  # Kept for deletion, though API only strictly expects {"type", "url"} for frontend
        }
    except Exception as e:
        logger.error(f"Failed to upload media to Cloudinary: {str(e)}")
        raise e

def delete_media(public_id: str, resource_type: str = "image") -> bool:
    """
    Deletes a file from Cloudinary given its public_id.
    """
    if not CLOUDINARY_CLOUD_NAME:
        return False
        
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get("result") == "ok"
    except Exception as e:
        logger.error(f"Failed to delete media from Cloudinary (public_id: {public_id}): {str(e)}")
        return False
