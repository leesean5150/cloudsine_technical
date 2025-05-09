from fastapi import APIRouter

from .endpoints import router as test_router

router = APIRouter()

router.include_router(test_router, prefix="/db")