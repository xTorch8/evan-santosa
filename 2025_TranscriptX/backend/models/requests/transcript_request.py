from pydantic import BaseModel

class TranscriptRequest(BaseModel):
    userID: str
    name: str | None = None
    description: str | None = None
    file: str