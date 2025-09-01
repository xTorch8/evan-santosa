from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

def get_current_date():
    return datetime.now(timezone.utc)

class TimestampMixin(SQLModel):
    dateIn: datetime = Field(default_factory = get_current_date)
    dateUp: datetime | None = Field(default_factory = None)
    isActive: bool = Field(default = True)