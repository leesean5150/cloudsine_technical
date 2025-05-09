from fastapi import APIRouter

from .test.router import router as test_router
from .files.router import router as files_router

router = APIRouter()

router.include_router(test_router)
router.include_router(files_router)
