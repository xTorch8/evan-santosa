from sqlmodel import Field, Relationship
from databases.timestamp_mixin import TimestampMixin
from databases.tr_workspace_detail import TrWorkspaceDetail

class LtTools(TimestampMixin, table = True):
    __tablename__ = "LtTools"  
    __table_args__ = {"extend_existing": True}

    toolsID: int = Field(default = None, primary_key = True)
    name: str = Field(max_length = 36)

    workspaceDetail: list["TrWorkspaceDetail"] = Relationship(back_populates = "tool")