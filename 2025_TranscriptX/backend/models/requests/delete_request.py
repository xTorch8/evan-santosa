from typing import List
from pydantic import BaseModel, Field

class DeleteRequest(BaseModel):
    workspaceID: List[str] = Field(..., alias="workspaceID")
    userID: str