from pydantic import BaseModel
from typing import Optional

class EditRequest(BaseModel):
    workspaceID: str
    userID: str
    title: Optional[str]
    description: Optional[str]
    shared: Optional[bool]