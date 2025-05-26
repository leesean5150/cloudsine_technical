from fastapi import APIRouter

from .endpoints import router as files_router

# populate file routes with endpoints from endpoints.py

router = APIRouter()

router.include_router(files_router, prefix="/file", tags=["files"])