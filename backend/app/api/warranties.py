from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.api.auth import CurrentActiveUser, DbSession
from app.models.product import Product
from app.schemas.product import ProductPublic
from app.services.warranty import serialize_product

router = APIRouter(prefix="/warranties", tags=["Warranties"])


@router.get("/expiring", response_model=list[ProductPublic])
def get_expiring_warranties(
    db: DbSession,
    current_user: CurrentActiveUser,
    days: int = Query(default=30, ge=1, le=365),
) -> list[ProductPublic]:
    today = date.today()
    upper_bound = today + timedelta(days=days)

    products = db.scalars(
        select(Product)
        .where(
            Product.user_id == current_user.id,
            Product.warranty_expiry_date >= today,
            Product.warranty_expiry_date <= upper_bound,
        )
        .order_by(Product.warranty_expiry_date.asc(), Product.id.asc())
    ).all()

    return [serialize_product(product, today=today) for product in products]
