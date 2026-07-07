from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    brand: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=120)
    purchase_date: date
    purchase_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    retailer: str | None = Field(default=None, max_length=255)
    serial_number: str | None = Field(default=None, max_length=255)
    warranty_duration_months: int = Field(ge=1, le=600)
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Product name must not be empty.")
        return normalized

    @field_validator("brand", "category", "retailer", "serial_number", "notes")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    brand: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=120)
    purchase_date: date | None = None
    purchase_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    retailer: str | None = Field(default=None, max_length=255)
    serial_number: str | None = Field(default=None, max_length=255)
    warranty_duration_months: int | None = Field(default=None, ge=1, le=600)
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Product name must not be empty.")
        return normalized

    @field_validator("brand", "category", "retailer", "serial_number", "notes")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class ProductPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    brand: str | None
    category: str | None
    purchase_date: date
    purchase_price: Decimal | None
    retailer: str | None
    serial_number: str | None
    warranty_duration_months: int
    warranty_expiry_date: date
    notes: str | None
    warranty_status: Literal["active", "expiring_soon", "expired"]
    days_remaining: int
    created_at: datetime
    updated_at: datetime
