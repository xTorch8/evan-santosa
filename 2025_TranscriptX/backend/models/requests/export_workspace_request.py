from pydantic import BaseModel

class ExportWorkspaceRequest(BaseModel):
    workspaceID: str