from sqlmodel import Field, Relationship
from databases.timestamp_mixin import TimestampMixin
from databases.tr_verification_token import TrVerificationToken

class LtVerificationType(TimestampMixin, table = True):
    __tablename__ = "LtVerificationType"  
    __table_args__ = {"extend_existing": True}

    verificationTypeID: int = Field(default = None, primary_key = True)
    type: str = Field(max_length = 36)

    tokens: list["TrVerificationToken"] = Relationship(back_populates = "verificationType")