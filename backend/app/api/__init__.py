from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.documents import router as documents_router
from app.api.products import router as products_router
from app.api.warranties import router as warranties_router

api_router = APIRouter(prefix="/api")


@api_router.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "WarrantyVault API",
    }


api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(documents_router)
api_router.include_router(dashboard_router)
api_router.include_router(warranties_router)
