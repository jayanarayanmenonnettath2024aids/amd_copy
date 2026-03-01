import os
import re
from fastapi import UploadFile, HTTPException
from config import MAX_UPLOAD_SIZE_BYTES, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS
from utils.logger import app_logger
from pathlib import Path

def sanitize_filename(filename: str) -> str:
    """Removes any potentially dangerous characters from the filename."""
    if not filename:
        return "unnamed_file"
    # Remove any characters other than alphanumeric, dot, dash, underscore
    sanitized = re.sub(r'[^a-zA-Z0-9.\-_]', '_', filename)
    return sanitized

async def validate_upload_file(file: UploadFile):
    """
    Validates the uploaded file for:
    1. Allowed MIME type
    2. Allowed Extension
    3. File size (Max 10MB)
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        app_logger.warning(f"Rejected file with invalid MIME type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Unsupported file format")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        app_logger.warning(f"Rejected file with invalid extension: {ext}")
        raise HTTPException(status_code=400, detail="Unsupported file extension")
    
    # Check file size by seeking to the end using the underlying file object
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    # Reset file pointer back to the beginning
    file.file.seek(0)
    
    if file_size > MAX_UPLOAD_SIZE_BYTES:
        app_logger.warning(f"File size exceeded: {file_size} bytes")
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB")
        
    return True
