from pydantic import BaseModel

class ShareResult(BaseModel):
    link: str | None