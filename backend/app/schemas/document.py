from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

AllowedDocumentType = Literal["bill", "invoice", "receipt", "warranty"]


class DocumentUploadInput(BaseModel):
    document_type: AllowedDocumentType
    product_id: int | None = None

    @field_validator("document_type", mode="before")
    @classmethod
    def normalize_document_type(cls, value: str) -> str:
        return value.strip().lower()


class DocumentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int | None
    original_filename: str
    stored_filename: str
    file_type: str
    file_size: int
    document_type: str
    uploaded_at: datetime
