# from sqlmodel import Field, Relationship
# from databases.timestamp_mixin import TimestampMixin
# # from databases.lt_feature import LtFeature
# # from databases.ms_user import MsUser
# import uuid

# class MsUserPermission(TimestampMixin, table = True):
#     __tablename__ = "MsUserPermission"  
#     __table_args__ = {"extend_existing": True}

#     userPermissionID: str = Field(primary_key = True, max_length = 36)
#     userID: str = Field(foreign_key = "MsUser.userID", max_length = 36)
#     featureID: int = Field(foreign_key = "LtFeature.featureID")

#     user: "MsUser" = Relationship(back_populates = "userPermissions")
#     feature: "LtFeature" = Relationship(back_populates = "userPermissions")