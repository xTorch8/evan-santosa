from pydantic import BaseModel

class ShareRequest(BaseModel):
    workspaceID: str
    isGrantAccess: bool | None = True