from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class DashboardFilterRequest(BaseModel):
    userID: str
    startDate: Optional[datetime] = None  # Format: "YYYY-MM-DD"
    endDate: Optional[datetime] = None
    search: Optional[str] = None
    type: Optional[str] = None  # "Transcription", "Summarization", "Transcription and Summarization"
    sharedStatus: Optional[bool] = None  # "shared" | "private"
    sortBy: Optional[str] = None  # "createdDate", "title", "description", "type", "link"
    sortOrder: Optional[str] = "desc"  # "asc" | "desc"
