from sqlmodel import Field, Relationship
from databases.timestamp_mixin import TimestampMixin
# from databases.lt_role import LtRole
# from databases.ms_user_permission import MsUserPermission
from databases.tr_workspace import TrWorkspace
from databases.tr_verification_token import TrVerificationToken
from datetime import datetime
import uuid

class MsUser(TimestampMixin, table = True):
    __tablename__ = "MsUser"  
    __table_args__ = {"extend_existing": True}

    userID: str = Field(primary_key = True, max_length = 36)
    name: str = Field(max_length = 255)
    email: str = Field(max_length = 255)
    password: str = Field(max_length = 64)
    # roleID: int = Field(foreign_key = "LtRole.roleID")
    isVerified: bool
    lastLogin: datetime | None
    
    # role: "LtRole" = Relationship(back_populates = "users")
    # userPermissions: list["MsUserPermission"] = Relationship(back_populates = "user")
    workspaces: list["TrWorkspace"] = Relationship(back_populates = "user")
    tokens: list["TrVerificationToken"] = Relationship(back_populates = "user")