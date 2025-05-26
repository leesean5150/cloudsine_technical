from fastapi import APIRouter

from .endpoints import router as test_router

# populate db routes with endpoints from endpoints.py

router = APIRouter()

router.include_router(test_router, prefix="/db")