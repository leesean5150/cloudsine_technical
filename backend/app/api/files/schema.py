from uuid import uuid4
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict
# import pytz

class SaveAnalysisRequest(BaseModel):
    filename: str
    analysis: Optional[Dict] = None

class FileModel(BaseModel):
    uuid: str = Field(
        default_factory=lambda: str(uuid4()), example=str(uuid4())
    )
    filename: str = Field(default="", example="example.js")
    date_created: datetime = Field(default_factory=lambda: datetime.now())
    analysis: Optional[Dict] = Field(default=None)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        orm_mode = True
