from fastapi import APIRouter

from .db.router import router as db_router

# include db endpoints in test endpoint

router = APIRouter()

router.include_router(db_router, prefix="/test", tags=["test"])