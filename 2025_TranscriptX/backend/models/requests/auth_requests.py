from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordTokenRequest(BaseModel):
    token: str
    new_password: str

class GenerateTokenRequest(BaseModel):
    typeID: int
    email: str