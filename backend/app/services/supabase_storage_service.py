import uuid
import logging
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

BUCKET = "stafin-homes"

def _get_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def upload_media(file, file_type: str, filename: str) -> dict:
    """Upload image or video to Supabase Storage."""
    supabase = _get_client()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    storage_path = f"{file_type}s/{uuid.uuid4()}.{ext}"
    content = file.read()
    mime = "video/mp4" if file_type == "video" else "image/jpeg"
    supabase.storage.from_(BUCKET).upload(storage_path, content, {"content-type": mime})
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"
    return {"type": file_type, "url": public_url, "public_id": storage_path}

def delete_media(public_id: str, resource_type: str = "image") -> bool:
    """Delete a file from Supabase Storage by its storage path (public_id)."""
    try:
        supabase = _get_client()
        supabase.storage.from_(BUCKET).remove([public_id])
        return True
    except Exception as e:
        logger.error(f"Failed to delete from Supabase Storage: {e}")
        return False
