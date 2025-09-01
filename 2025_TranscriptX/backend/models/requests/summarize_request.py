from pydantic import BaseModel

class SummarizeRequest(BaseModel):
    userID: str
    name: str | None = None
    description: str | None = None
    file: str | None = None
    workspaceID: str | None = None