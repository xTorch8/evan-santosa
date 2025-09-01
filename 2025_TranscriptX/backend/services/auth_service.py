from fastapi import HTTPException
from repositories.auth_repository import AuthRepository
from models.requests.auth_requests import RegisterRequest, LoginRequest, ResetPasswordRequest, ResetPasswordTokenRequest, GenerateTokenRequest
from models.responses.auth_responses import TokenResponse
from databases.ms_user import MsUser
from databases.tr_verification_token import TrVerificationToken
from models.responses.response import Response
from models.responses.auth_responses import TokenResponse
from http import HTTPStatus
from utils import hash_utils, jwt_utils, email_utils
from uuid import uuid4
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

load_dotenv()

MAX_FAILED_ATTEMPTS = int(os.getenv("MAX_FAILED_ATTEMPTS", 3))
SESSION_TIMEOUT_MINUTES = int(os.getenv("SESSION_TIMEOUT_MINUTES", 15))
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", 30))

async def register_user(request: RegisterRequest, db):
    try:
        repo = AuthRepository(db)
        if repo.get_user_by_email(request.email):
            return Response(
                statusCode = HTTPStatus.BAD_REQUEST,
                message = "Email already registered",
                payload = None  
            )
            # raise HTTPException(status_code=400, detail="Email already registered")

        # if repo.get_user_by_name(request.name):
            # raise HTTPException(status_code=400, detail="Username already taken")

        if not hash_utils.validate_password_policy(request.password):
            return Response(
                statusCode = HTTPStatus.BAD_REQUEST,
                message = "Weak password. The password must be at least 8 characters long, have at least one uppercase character, one lowercase character, one number, and a special character.",
                payload = None
            )
            # raise HTTPException(status_code=400, detail="Weak password")

        hashed_password = hash_utils.hash_password(request.password)
        user_id = str(uuid4())
        verification_token = str(uuid4())

        user = MsUser(
            userID=user_id,
            name=request.name,
            email=request.email,
            password=hashed_password,
            # roleID=1,
            isVerified=False
        )

        repo.create_user(user)

        token_entry = TrVerificationToken(
            verificationTokenID=str(uuid4()),
            userID=user_id,
            verificationTypeID=1,
            token=verification_token,
            expires=datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        )

        repo.create_verification_token(token_entry)
        if not email_utils.send_verification_email(request.email, verification_token):
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = "SMTP Server error",
                payload = None
            )

        db.commit()

        return Response(
            statusCode = HTTPStatus.OK,
            message = "User registered, please verify your email.",
            payload = None
        )
    except Exception as e:
        return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
        )

async def verify_email(token: str, db):
    try:
        repo = AuthRepository(db)
        token_entry = repo.get_token(token)
        if not token_entry:
            return "Invalid token."

        if token_entry.expires < datetime.utcnow():
            return "Expired token."

        user = repo.get_user_by_email(token_entry.user.email)
        user.isVerified = True
        # repo.update_user(user)
        repo.delete_verification_token(token_entry)

        db.commit()
        return "Email verified successfully. Please login."

    except Exception as e:
        print(e)
        return "Internal server error."

async def login_user(request: LoginRequest, db):
    try:
        repo = AuthRepository(db)
        user = repo.get_user_by_email(request.email)
        if not user or not hash_utils.verify_password(request.password, user.password):
            return Response(
                statusCode = HTTPStatus.UNAUTHORIZED,
                message = "Invalid credentials",
                payload = None
            )
            # raise HTTPException(status_code=401, detail="Invalid credentials")

        if not user.isVerified:
            return Response(
                statusCode = HTTPStatus.FORBIDDEN,
                message = "Email not verified",
                payload = None
            )
            # raise HTTPException(status_code=403, detail="Email not verified")

        # user.failed_login_attempts = 0
        user.lastLogin = datetime.utcnow()
        # repo.update_user(user)

        token = jwt_utils.create_access_token(
            # data = {"sub": user.userID, "role": user.roleID},
            data = {"sub": user.userID, "name": user.name},
            expires_delta = timedelta(minutes=SESSION_TIMEOUT_MINUTES)
        )

        db.commit()

        return Response[TokenResponse](
            statusCode = HTTPStatus.OK,
            message = None,
            payload = TokenResponse(access_token = token, token_type = "bearer")
        )

        # return TokenResponse(access_token=token, token_type="bearer")
    except Exception as e:
        return Response(
            statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
            message = str(e),
            payload = None 
        )
    
async def logout_user():
    return {"message": "Successfully logged out"}

async def generate_token(request: GenerateTokenRequest, db):
    try:
        repo = AuthRepository(db)

        user = repo.get_user_by_email(request.email)

        if user is None:
            return Response(
                statusCode = HTTPStatus.NOT_FOUND,
                message = "User is not found. Please register.",
                payload = None
            )
        
        get_user_token = repo.get_token_by_user(user.userID, request.typeID)
        if get_user_token is not None:
            if get_user_token.dateIn and datetime.utcnow() - get_user_token.dateIn <= timedelta(minutes = 2):
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "You can request another token after 2 minutes.",
                    payload = None
                )
        
        token = str(uuid4())

        if not user.isVerified and request.typeID == 2:
            return Response(
                statusCode = HTTPStatus.FORBIDDEN,
                message = "Email not verified",
                payload = None
            )        
        
        if user.isVerified and request.typeID == 1:
            return Response(
                statusCode = HTTPStatus.FORBIDDEN,
                message = "Account already verified",
                payload = None
            )

        verification_token = TrVerificationToken(
            verificationTokenID = str(uuid4()),
            userID = user.userID,
            verificationTypeID = request.typeID,
            token = token,
            expires = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        )

        repo.create_verification_token(verification_token)

        if request.typeID == 1:
            if not email_utils.send_verification_email(user.email, token):
                return Response(
                    statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                    message = "SMTP Server error",
                    payload = None
                )
        elif request.typeID == 2:
            if not email_utils.send_reset_password_email(user.email, token):
                return Response(
                    statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                    message = "SMTP Server error",
                    payload = None
                )
        else:
            return Response(
                statusCode = HTTPStatus.BAD_REQUEST,
                message = "Invalid typeID",
                payload = None
            )

        db.commit()

        return Response(
            statusCode = HTTPStatus.OK,
            message = "Please check your email",
            payload = None
        )
    except Exception as e:
        return Response(
            statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
            message = str(e),
            payload = None
        )

async def request_password_reset(request: ResetPasswordRequest, db):
    try:
        repo = AuthRepository(db)
        user = repo.get_user_by_email(request.email)
        if not user:
            return Response(
                statusCode = HTTPStatus.NOT_FOUND,
                message = "User not found",
                payload = None
            )
            # raise HTTPException(status_code=404, detail="User not found")

        if not user.isVerified:
            return Response(
                statusCode = HTTPStatus.FORBIDDEN,
                message = "Email not verified",
                payload = None
            )
        token = str(uuid4())
        token_entry = TrVerificationToken(
            verificationTokenID=str(uuid4()),
            userID=user.userID,
            verificationTypeID=2,
            token=token,
            expires=datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        )
        repo.create_verification_token(token_entry)
        
        if not email_utils.send_reset_password_email(user.email, token):
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = "SMTP Server error",
                payload = None
            )

        db.commit()
        return Response(
            statusCode = HTTPStatus.OK,
            message = "Reset password link sent",
            payload = None
        )
        # return {"message": "Reset password link sent"}
    except Exception as e:
        return Response(
            statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
            message = str(e),
            payload = None
        )

async def reset_password(request: ResetPasswordTokenRequest, db):
    try:
        repo = AuthRepository(db)
        token_entry = repo.get_token(request.token)
        if not token_entry or token_entry.verificationTypeID != 2:
            return Response(
                statusCode = HTTPStatus.BAD_REQUEST,
                message = "Invalid reset token.",
                payload = None
            )
            # raise HTTPException(status_code=400, detail="Invalid reset token")

        if token_entry.expires < datetime.utcnow():
            return Response(
                statusCode = HTTPStatus.BAD_REQUEST,
                message = "Reset token expired.",
                payload = None
            )            
            # raise HTTPException(status_code=400, detail="Reset token expired")

        user = repo.get_user_by_email(token_entry.user.email)
        if not hash_utils.validate_password_policy(request.new_password):
            return Response(
                statusCode = HTTPStatus.BAD_REQUEST,
                message = "Weak password. The password must be at least 8 characters long, have at least one uppercase character, one lowercase character, one number, and a special character.",
                payload = None
            )            
            # raise HTTPException(status_code=400, detail="Weak password")

        user.password = hash_utils.hash_password(request.new_password)
        # repo.update_user(user)
        repo.delete_verification_token(token_entry)

        db.commit()
        return Response(
            statusCode = HTTPStatus.OK,
            message = "Password has been reset.",
            payload = None
        )
        # return {"message": "Password has been reset"}
    except Exception as e:
        return Response(
            statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
            message = str(e),
            payload = None
        )
