from __future__ import annotations

from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.api.auth import CurrentActiveUser, DbSession
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductPublic, ProductUpdate
from app.services.warranty import (
    calculate_warranty_expiry_date,
    serialize_product,
)

router = APIRouter(prefix="/products", tags=["Products"])

SortField = Literal["created_at", "purchase_date", "warranty_expiry_date", "name"]
SortOrder = Literal["asc", "desc"]
ProductStatus = Literal["active", "expiring_soon", "expired"]

SORT_COLUMNS = {
    "created_at": Product.created_at,
    "purchase_date": Product.purchase_date,
    "warranty_expiry_date": Product.warranty_expiry_date,
    "name": Product.name,
}


def apply_status_filter(
    query: Select[tuple[Product]],
    status_value: ProductStatus,
    today: date,
) -> Select[tuple[Product]]:
    soon_cutoff = date.fromordinal(today.toordinal() + 30)
    if status_value == "expired":
        return query.where(Product.warranty_expiry_date < today)
    if status_value == "expiring_soon":
        return query.where(
            Product.warranty_expiry_date >= today,
            Product.warranty_expiry_date <= soon_cutoff,
        )
    return query.where(Product.warranty_expiry_date > soon_cutoff)


def get_owned_product_or_404(
    db: Session,
    user_id: int,
    product_id: int,
) -> Product:
    product = db.scalar(
        select(Product).where(Product.id == product_id, Product.user_id == user_id)
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )
    return product


@router.post("", response_model=ProductPublic, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> ProductPublic:
    product = Product(
        user_id=current_user.id,
        name=payload.name,
        brand=payload.brand,
        category=payload.category,
        purchase_date=payload.purchase_date,
        purchase_price=payload.purchase_price,
        retailer=payload.retailer,
        serial_number=payload.serial_number,
        warranty_duration_months=payload.warranty_duration_months,
        warranty_expiry_date=calculate_warranty_expiry_date(
            payload.purchase_date,
            payload.warranty_duration_months,
        ),
        notes=payload.notes,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return serialize_product(product)


@router.get("", response_model=list[ProductPublic])
def list_products(
    db: DbSession,
    current_user: CurrentActiveUser,
    search: str | None = Query(default=None, max_length=255),
    category: str | None = Query(default=None, max_length=120),
    status_value: Annotated[ProductStatus | None, Query(alias="status")] = None,
    sort_by: SortField = "created_at",
    sort_order: SortOrder = "desc",
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[ProductPublic]:
    query = select(Product).where(Product.user_id == current_user.id)
    today = date.today()

    if search:
        term = f"%{search.strip()}%"
        if term != "%%":
            query = query.where(
                or_(
                    Product.name.ilike(term),
                    Product.brand.ilike(term),
                    Product.retailer.ilike(term),
                    Product.serial_number.ilike(term),
                )
            )

    if category:
        normalized_category = category.strip().lower()
        if normalized_category:
            query = query.where(func.lower(Product.category) == normalized_category)

    if status_value:
        query = apply_status_filter(query, status_value, today)

    sort_column = SORT_COLUMNS[sort_by]
    ordering = asc(sort_column) if sort_order == "asc" else desc(sort_column)
    query = query.order_by(ordering, desc(Product.id)).offset(skip).limit(limit)

    products = db.scalars(query).all()
    return [serialize_product(product, today=today) for product in products]


@router.get("/{product_id}", response_model=ProductPublic)
def get_product(
    product_id: int,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> ProductPublic:
    product = get_owned_product_or_404(db, current_user.id, product_id)
    return serialize_product(product)


@router.patch("/{product_id}", response_model=ProductPublic)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> ProductPublic:
    product = get_owned_product_or_404(db, current_user.id, product_id)
    update_data = payload.model_dump(exclude_unset=True)

    for field_name, value in update_data.items():
        setattr(product, field_name, value)

    if "purchase_date" in update_data or "warranty_duration_months" in update_data:
        product.warranty_expiry_date = calculate_warranty_expiry_date(
            product.purchase_date,
            product.warranty_duration_months,
        )

    db.commit()
    db.refresh(product)
    return serialize_product(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> Response:
    product = get_owned_product_or_404(db, current_user.id, product_id)
    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
