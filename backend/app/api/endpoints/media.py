from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.api.deps import get_current_admin
from app.models.admin import Admin
from app.services.cloudinary_service import upload_media, delete_media
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"]
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024 # 50MB

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    # Validate MIME type
    content_type = file.content_type
    
    if content_type in ALLOWED_IMAGE_TYPES:
        file_type = "image"
        max_size = MAX_IMAGE_SIZE
    elif content_type in ALLOWED_VIDEO_TYPES:
        file_type = "video"
        max_size = MAX_VIDEO_SIZE
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {content_type}. Allowed types: {ALLOWED_IMAGE_TYPES + ALLOWED_VIDEO_TYPES}"
        )
    
    # Read content to check size and pass to cloudinary
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size for {file_type}s is {max_size / (1024*1024):.0f}MB."
        )
    
    # Upload to Cloudinary
    try:
        result = upload_media(content, file_type)
        return result
    except Exception as e:
        logger.error(f"Media upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload media to cloud."
        )

@router.delete("/delete")
async def delete_file(
    public_id: str,
    resource_type: str = "image",
    current_admin: Admin = Depends(get_current_admin)
):
    if not public_id:
        raise HTTPException(status_code=400, detail="public_id is required")
        
    success = delete_media(public_id, resource_type)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete media or media not found.")
        
    return {"message": "Successfully deleted media item."}
