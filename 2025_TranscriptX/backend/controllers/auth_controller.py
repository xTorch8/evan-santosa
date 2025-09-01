from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from databases.dependencies import get_session
from services.auth_service import register_user,verify_email,login_user,request_password_reset,reset_password, generate_token
from models.requests.auth_requests import RegisterRequest,LoginRequest,ResetPasswordRequest,ResetPasswordTokenRequest, GenerateTokenRequest
from services import auth_service

router = APIRouter(prefix="/api/auth",tags=["Authentication"])

@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_session)):
    return await register_user(request, db)

@router.get("/verify-email")
async def verify(token: str, db: Session = Depends(get_session)):
    return await verify_email(token, db)

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_session)):
    return await login_user(request, db)

@router.post("/logout")
async def logout():
    return await auth_service.logout_user()

@router.post("/request-password-reset")
async def request_reset(request: ResetPasswordRequest, db: Session = Depends(get_session)):
    return await request_password_reset(request, db)

@router.post("/reset-password")
async def reset_with_token(request: ResetPasswordTokenRequest, db: Session = Depends(get_session)):
    return await reset_password(request, db)

@router.post("/generate-token")
async def generate_token_handler(request: GenerateTokenRequest, db: Session = Depends(get_session)):
    return await generate_token(request, db)
