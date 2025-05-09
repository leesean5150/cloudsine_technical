from fastapi import APIRouter

from .endpoints import router as files_router

router = APIRouter()

router.include_router(files_router, prefix="/file", tags=["files"])