from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel
import os
from pathlib import Path

from database import get_session

router = APIRouter()

class MediaResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    mime_type: str
    size_bytes: int
    url: str

@router.post("/upload", response_model=MediaResponse)
async def upload_media(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session)
):
    # Basic file validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.mp3', '.mp4'}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_ext} not allowed"
        )
    
    # Read and validate file size
    content = await file.read()
    max_size = int(os.getenv("MAX_UPLOAD_SIZE", "52428800"))  # 50MB default
    if len(content) > max_size:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large: {len(content)} bytes"
        )
    
    # Create media directory if it doesn't exist
    media_path = Path(os.getenv("MEDIA_PATH", "../../data/media"))
    media_path.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    import uuid
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = media_path / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return response (we'll save to database later)
    return MediaResponse(
        id=1,  # Placeholder
        filename=unique_filename,
        original_filename=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        url=f"/api/media/{unique_filename}"
    )

@router.get("/{filename}")
async def serve_media(filename: str):
    """Serve media files"""
    media_path = Path(os.getenv("MEDIA_PATH", "../../data/media"))
    file_path = media_path / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # For now, just return the file info
    # In production, you'd use FileResponse or serve via nginx
    return {"message": f"File {filename} exists", "path": str(file_path)}