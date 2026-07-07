from fastapi import APIRouter

api_router = APIRouter(prefix="/api")


@api_router.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "WarrantyVault API",
    }
