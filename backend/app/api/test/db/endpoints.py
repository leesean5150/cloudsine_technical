from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import AsyncConnection

from db.postgres import get_async_session

router = APIRouter()

@router.get(
    "",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {"description": "Item added successfully"},
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "description": "DB connection unavailable"
        },
    },
)
async def test_db_connection(conn: AsyncConnection = Depends(get_async_session)):
    """
    a test database connection endpoint which queries all files and returns the first one in the response body.
    """
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM files;")
            result = await cur.fetchone()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )