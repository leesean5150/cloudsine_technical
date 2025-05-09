from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from psycopg import AsyncConnection
import requests
import asyncio
import magic
import json

from config import settings
from db.postgres import get_async_session

router = APIRouter()

VIRUSTOTAL_API_URL = "https://www.virustotal.com/api/v3/files"
VIRUSTOTAL_API_KEY = settings.VIRUSTOTAL_API_KEY

MAX_FILE_SIZE = 1 * 1024 * 1024

headers = {
    "x-apikey": VIRUSTOTAL_API_KEY
}


async def get_files(
    conn: AsyncConnection = Depends(get_async_session)
):
    try:
        query = """
            SELECT uuid, filename, created_at, analysis
            FROM files
            ORDER BY created_at DESC
        """

        async with conn.cursor() as cur:
            await cur.execute(query)
            results = await cur.fetchall()
            
            # Convert each row to a dictionary
            files = []
            for row in results:
                files.append({
                    "uuid": row["uuid"],
                    "filename": row["filename"],
                    "created_at": row["created_at"],
                    "analysis": row["analysis"]
                })
            
            return files
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def scan_file(file: UploadFile = File(...)):
    """
    with sanitization and secure uploading of files.
    """
    try:

        # check file content to see if the type is what the extension actually is
        # file_head = await file.read(2048)
        # mime_type = magic.from_buffer(file_head, mime=True)

        # if mime_type not in ["application/javascript", "text/javascript"]:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Unsupported file type. Only .js files are allowed.",
        #     )

        # await file.seek(0)

        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 0.5MB limit.",
            )

        # rename file to a neutral extension to prevent execution
        safe_filename = file.filename + ".txt"
        files = {
            "file": (safe_filename, content, "text/plain")
        }

        upload_response = requests.post(VIRUSTOTAL_API_URL, headers=headers, files=files)

        if upload_response.status_code != 200:
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY,
                detail="VirusTotal file upload failed. Please try again in a while.",
            )

        for _ in range(5):
            analysis_url = upload_response.json()["data"]["links"]["self"]
            analysis_response = requests.get(analysis_url, headers=headers)
            await asyncio.sleep(10)

            if analysis_response.json()["data"]["attributes"]["status"] == "completed":
                break

        if analysis_response.json()["data"]["attributes"]["status"] != "completed":
            raise Exception("Analysis status not completed after 5 attempts")

        return analysis_response.json()

    except Exception as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    
async def save_file_analysis(
    filename: str,
    analysis: dict,
    conn: AsyncConnection = Depends(get_async_session)
):
    try:
        query = """
            INSERT INTO files (filename, analysis)
            VALUES (%s, %s::jsonb)
            RETURNING uuid, created_at;
        """

        async with conn.cursor() as cur:
            await cur.execute(query, (filename, json.dumps(analysis)))
            result = await cur.fetchone()

        return {
            "message": "File analysis successfully saved.",
            "uuid": result["uuid"],
            "created_at": result["created_at"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error: {str(e)}"
        )
    

async def delete_file_analysis(
    id: str,
    conn: AsyncConnection = Depends(get_async_session)
):
    try:
        query = """
            DELETE FROM files
            WHERE uuid = %s
            RETURNING uuid, filename;
        """

        async with conn.cursor() as cur:
            await cur.execute(query, (id,))
            result = await cur.fetchone()

            if not result:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File analysis not found"
                )

        return {
            "message": "File analysis deleted successfully",
            "deleted_id": result["uuid"],
            "filename": result["filename"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete: {str(e)}"
        )