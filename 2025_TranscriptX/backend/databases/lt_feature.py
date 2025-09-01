# from sqlmodel import Field, Relationship
# from databases.timestamp_mixin import TimestampMixin
# from databases.ms_user_permission import MsUserPermission

# class LtFeature(TimestampMixin, table = True):
#     __tablename__ = "LtFeature"  
#     __table_args__ = {"extend_existing": True}

#     featureID: int = Field(default = None, primary_key = True)
#     name: str = Field(max_length = 36)
#     description: str = Field(max_length = 255)
#     url: str = Field(max_length = 255)

#     userPermissions: list["MsUserPermission"] = Relationship(back_populates = "feature")