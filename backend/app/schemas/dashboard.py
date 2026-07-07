from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class UpcomingExpiryItem(BaseModel):
    id: int
    name: str
    brand: str | None
    warranty_expiry_date: date
    days_remaining: int
    warranty_status: Literal["active", "expiring_soon", "expired"]


class DashboardResponse(BaseModel):
    total_products: int
    active_warranties: int
    expiring_soon: int
    expired_warranties: int
    total_documents: int
    total_purchase_value: Decimal
    upcoming_expiries: list[UpcomingExpiryItem]
