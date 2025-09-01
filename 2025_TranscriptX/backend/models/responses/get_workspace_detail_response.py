from pydantic import BaseModel
from datetime import datetime

class GetWorkspaceDetailResult(BaseModel):
    title: str | None
    author: str
    createdDate: datetime
    type: str
    fileName: str
    file: str
    sharedLink: str | None
    description: str | None
    transcription: str | None
    summarization: str | None
    isShareable: bool
    isCanSummarized: bool