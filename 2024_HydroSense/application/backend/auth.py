from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form,Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from database import SessionLocal
from models.models import User, UserCompanyMapping,Company
import jwt
from datetime import datetime, timedelta
from typing import Optional
import cloudinary
import cloudinary.uploader
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address



router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "5f4b8d6e9a4c3e01b7d9a2f8041c7c92db16e4a5f32c7f081e3f6a7b4c5d920e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


cloudinary.config(
    cloud_name='dqnwgswnw',
    api_key='194188234624597',
    api_secret='ZsNvOsVwHO6W_gYcij37sYQnExs'
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

limiter = Limiter(key_func=get_remote_address)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    company_id: Optional[int] = None

class UserResponse(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: Optional[int] = None
    company_id: Optional[int] = None

    class Config:
        orm_mode = True



def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        company_id: Optional[int] = payload.get("company_id")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, company_id=company_id)
    except jwt.PyJWTError:
        raise credentials_exception
    return token_data

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.Email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.Role != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    return current_user

def get_current_super_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.Role != 3:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    return current_user

def get_user_company_id(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    return token_data.company_id

# Register User Endpoint
@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("50/minute")
def register_user(request: Request,user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.Email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        FirstName=user.first_name,
        LastName=user.last_name,
        Email=user.email,
        Password=hashed_password,
        Role=2  # Set Role to None or a default value if needed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully", "email": db_user.Email}

# Login User Endpoint
@router.post("/login", response_model=Token)
@limiter.limit("50/minute")
def login_user(request: Request,user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.Email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.Password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Get the user's company ID if they have one
    user_company_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserID == db_user.UserID).first()
    company_id = user_company_mapping.CompanyID if user_company_mapping else None

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.Email, "user_id": db_user.UserID, "role": db_user.Role, "company_id": company_id},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

# Example Protected Route
@router.get("/users/me", response_model=UserResponse)
@limiter.limit("50/minute")
def read_users_me(request: Request,current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get the user's company ID if they have one
    user_company_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserID == current_user.UserID).first()
    company_id = user_company_mapping.CompanyID if user_company_mapping else None

    return UserResponse(
        first_name=current_user.FirstName,
        last_name=current_user.LastName,
        email=current_user.Email,
        role=current_user.Role,
        company_id=company_id
    )

# Check Token Validity Endpoint
@router.get("/check-token")
def check_token_validity(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        verify_token(token, credentials_exception)
        return {"message": "Token is valid"}
    except HTTPException as e:
        raise e