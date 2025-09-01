from pydantic import BaseModel

class GetWorkspaceDetailRequest(BaseModel):
    workspaceID: str
    userID: str