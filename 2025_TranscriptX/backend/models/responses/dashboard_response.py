from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class DashboardHistoryItem(BaseModel):
    workspaceID: str
    title: Optional[str]
    description: Optional[str]
    type: str  # Transcription / Summarization / Transcription and Summarization
    createdDate: str | datetime # Format: "YYYY-MM-DD"
    fileName: str
    link: Optional[str]
    isShared: bool

class DashboardHistoryResponse(BaseModel):
    items: List[DashboardHistoryItem]
