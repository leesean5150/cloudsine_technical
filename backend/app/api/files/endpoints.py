from uuid import uuid4
from psycopg import AsyncConnection
import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Form, Path

from db.postgres import get_async_session
from . import handlers

router = APIRouter()


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {"description": "List of documents"},
        status.HTTP_400_BAD_REQUEST: {"description": "Bad request"},
    },
)
async def get_documents(conn: AsyncConnection = Depends(get_async_session)):
    """
    Get all documents from the database
    """
    try:
        response = await handlers.get_files(conn)
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Failed to get files. Please try again in a while.",
        )


@router.post(
    "/scan",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {"description": "File scanned successfully"},
        status.HTTP_400_BAD_REQUEST: {"description": "Scan failed"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "An error has occured. Please try again."}
    },
)
async def scan_document(file: UploadFile = File(...)):
    """
    Scans the uploaded file for malicious content.
    """
    try:
        response = await handlers.scan_file(file)
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Scan failed. Please try again in a while.",
        )


@router.post("/save_analysis")
async def save_file_analysis(
    filename: str = Form(...),
    analysis: str = Form(...),
    conn: AsyncConnection = Depends(get_async_session)
):
    """
    Saves a file analysis.
    """
    try:
        analysis_data: Dict[str, Any] = json.loads(analysis)

        return await handlers.save_file_analysis(
            filename=filename,
            analysis=analysis_data,
            conn=conn
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )


@router.delete("/{id}")
async def delete_file_analysis(
    id: str = Path(..., description="The ID of the file to delete"),
    conn: AsyncConnection = Depends(get_async_session)
):
    """
    Deletes a file analysis.
    """
    try:
        return await handlers.delete_file_analysis(
            id=id,
            conn=conn
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )

    