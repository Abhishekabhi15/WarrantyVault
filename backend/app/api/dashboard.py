from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.auth import CurrentActiveUser, DbSession
from app.models.document import Document
from app.models.product import Product
from app.schemas.dashboard import DashboardResponse
from app.services.warranty import serialize_upcoming_expiry, snapshot_for_product

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: DbSession,
    current_user: CurrentActiveUser,
) -> DashboardResponse:
    products = db.scalars(
        select(Product)
        .where(Product.user_id == current_user.id)
        .order_by(Product.warranty_expiry_date.asc(), Product.id.asc())
    ).all()
    today = date.today()

    active_warranties = 0
    expiring_soon = 0
    expired_warranties = 0
    upcoming_expiries = []

    for product in products:
        snapshot = snapshot_for_product(product, today=today)
        if snapshot.warranty_status == "active":
            active_warranties += 1
        elif snapshot.warranty_status == "expiring_soon":
            expiring_soon += 1
        else:
            expired_warranties += 1

        if snapshot.days_remaining >= 0 and len(upcoming_expiries) < 5:
            upcoming_expiries.append(serialize_upcoming_expiry(product, today=today))

    total_documents = db.scalar(
        select(func.count(Document.id)).where(Document.user_id == current_user.id)
    ) or 0
    total_purchase_value = db.scalar(
        select(func.coalesce(func.sum(Product.purchase_price), 0)).where(
            Product.user_id == current_user.id
        )
    ) or Decimal("0")

    return DashboardResponse(
        total_products=len(products),
        active_warranties=active_warranties,
        expiring_soon=expiring_soon,
        expired_warranties=expired_warranties,
        total_documents=total_documents,
        total_purchase_value=total_purchase_value,
        upcoming_expiries=upcoming_expiries,
    )
