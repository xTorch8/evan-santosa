from sqlmodel import SQLModel, Field, Relationship, Text, create_engine
from dotenv import load_dotenv
from datetime import datetime, timezone
import os

from databases.timestamp_mixin import TimestampMixin
# from databases.lt_feature import LtFeature
# from databases.lt_role import LtRole
from databases.lt_tools import LtTools
from databases.lt_verification_type import LtVerificationType
from databases.ms_user import MsUser
# from databases.ms_user_permission import MsUserPermission
from databases.tr_verification_token import TrVerificationToken
from databases.tr_workspace import TrWorkspace  
from databases.tr_workspace_detail import TrWorkspaceDetail

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo = True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)