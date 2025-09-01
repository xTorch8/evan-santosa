from sqlmodel import Field, Relationship, Text
from databases.timestamp_mixin import TimestampMixin
# from databases.ms_user import MsUser
from databases.tr_workspace_detail import TrWorkspaceDetail
import uuid

class TrWorkspace(TimestampMixin, table = True):
    __tablename__ = "TrWorkspace"  
    __table_args__ = {"extend_existing": True}

    workspaceID: str = Field(primary_key = True, max_length = 36)
    name: str | None = Field(max_length = 255)
    description: str | None = Field(sa_column = Text)
    userID: str = Field(foreign_key = "MsUser.userID", max_length = 36)
    link: str | None = Field(max_length = 255)
    file: str = Field(sa_column = Text)

    user: "MsUser" = Relationship(back_populates = "workspaces")
    workspaceDetail: list["TrWorkspaceDetail"] = Relationship(back_populates = "workspace")