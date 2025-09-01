# from sqlmodel import Field, Relationship
# from databases.timestamp_mixin import TimestampMixin
# from databases.ms_user import MsUser

# class LtRole(TimestampMixin, table = True):
#     __tablename__ = "LtRole"  
#     __table_args__ = {"extend_existing": True}

#     roleID: int = Field(default = None, primary_key = True)
#     name: str = Field(max_length = 36)

#     users: list["MsUser"] = Relationship(back_populates = "role")