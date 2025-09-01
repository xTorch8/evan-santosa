from pydantic import BaseModel
from typing import Optional

class EditResponse(BaseModel):
    success: bool
    message: str
    updated_id: Optional[str] = None