from sqlmodel import Column, Field, Relationship, Text
from databases.timestamp_mixin import TimestampMixin
from datetime import datetime
# from databases.lt_verification_type import LtVerificationType

class TrVerificationToken(TimestampMixin, table = True):
    __tablename__ = "TrVerificationToken"  
    __table_args__ = {"extend_existing": True}

    verificationTokenID: str = Field(primary_key = True, max_length = 36)
    token: str = Field(sa_column = Column(Text))
    expires: datetime
    verificationTypeID: int = Field(foreign_key = "LtVerificationType.verificationTypeID")
    userID: str = Field(foreign_key = "MsUser.userID")

    verificationType: "LtVerificationType" = Relationship(back_populates = "tokens")
    user: "MsUser" = Relationship(back_populates = "tokens")