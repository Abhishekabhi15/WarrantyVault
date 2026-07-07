from fastapi import APIRouter

from app.api.auth import router as auth_router

api_router = APIRouter(prefix="/api")


@api_router.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "WarrantyVault API",
    }


api_router.include_router(auth_router)
