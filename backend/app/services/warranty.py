from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date

from app.models.product import Product
from app.schemas.dashboard import UpcomingExpiryItem
from app.schemas.product import ProductPublic


@dataclass(frozen=True)
class WarrantySnapshot:
    warranty_expiry_date: date
    warranty_status: str
    days_remaining: int


def add_months(source_date: date, months: int) -> date:
    month_index = source_date.month - 1 + months
    year = source_date.year + month_index // 12
    month = month_index % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def calculate_warranty_expiry_date(
    purchase_date: date,
    warranty_duration_months: int,
) -> date:
    return add_months(purchase_date, warranty_duration_months)


def build_warranty_snapshot(expiry_date: date, today: date | None = None) -> WarrantySnapshot:
    current_date = today or date.today()
    days_remaining = (expiry_date - current_date).days

    if expiry_date < current_date:
        status = "expired"
    elif days_remaining <= 30:
        status = "expiring_soon"
    else:
        status = "active"

    return WarrantySnapshot(
        warranty_expiry_date=expiry_date,
        warranty_status=status,
        days_remaining=days_remaining,
    )


def snapshot_for_product(product: Product, today: date | None = None) -> WarrantySnapshot:
    return build_warranty_snapshot(product.warranty_expiry_date, today=today)


def serialize_product(product: Product, today: date | None = None) -> ProductPublic:
    snapshot = snapshot_for_product(product, today=today)
    return ProductPublic.model_validate(
        {
            "id": product.id,
            "user_id": product.user_id,
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "purchase_date": product.purchase_date,
            "purchase_price": product.purchase_price,
            "retailer": product.retailer,
            "serial_number": product.serial_number,
            "warranty_duration_months": product.warranty_duration_months,
            "warranty_expiry_date": snapshot.warranty_expiry_date,
            "notes": product.notes,
            "warranty_status": snapshot.warranty_status,
            "days_remaining": snapshot.days_remaining,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
        }
    )


def serialize_upcoming_expiry(
    product: Product,
    today: date | None = None,
) -> UpcomingExpiryItem:
    snapshot = snapshot_for_product(product, today=today)
    return UpcomingExpiryItem(
        id=product.id,
        name=product.name,
        brand=product.brand,
        warranty_expiry_date=snapshot.warranty_expiry_date,
        days_remaining=snapshot.days_remaining,
        warranty_status=snapshot.warranty_status,
    )
