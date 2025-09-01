from pydantic import BaseModel

class TranscriptResult(BaseModel):
    result: str
    workspaceID: str