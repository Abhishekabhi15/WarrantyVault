from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".jpeg", ".jpg", ".png"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}


def get_upload_root() -> Path:
    return Path(settings.upload_dir)


def validate_upload(file: UploadFile, file_size: int) -> str:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Allowed types: PDF, JPEG, JPG, PNG.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file content type.",
        )

    if file_size > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded file exceeds the maximum allowed size.",
        )

    return suffix


def generate_stored_filename(suffix: str) -> str:
    return f"{uuid4().hex}{suffix}"
