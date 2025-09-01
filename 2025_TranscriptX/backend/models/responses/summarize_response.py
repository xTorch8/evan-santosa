from pydantic import BaseModel

class SummarizeResult(BaseModel):
    result: str
    workspaceID: str