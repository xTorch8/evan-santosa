from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt
from fastapi.responses import JSONResponse
from models.responses.response import Response
from http import HTTPStatus
from dotenv import load_dotenv 
import os

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        load_dotenv()
        self.jwt_secret_key = os.getenv("JWT_SECRET_KEY")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM")
        self.excluded_path = [
            "/docs",
            "/openapi.json",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify-email",
            "/api/auth/request-password-reset",
            "/api/auth/reset-password",
            "/api/auth/generate-token"
        ]

    async def dispatch(self, request: Request, call_next):
        try:
            if any(request.url.path.startswith(path) for path in self.excluded_path):
                return await call_next(request)

            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JSONResponse(
                    status_code = HTTPStatus.UNAUTHORIZED,
                    content = Response(
                        statusCode = HTTPStatus.UNAUTHORIZED,
                        message = "You are unauthorized.",
                        payload = None
                    ).dict()
                )
            
            token = auth_header.split(" ")[1]

            try:
                payload = jwt.decode(token, self.jwt_secret_key, algorithms = [self.jwt_algorithm])
            except Exception as e:
                return JSONResponse(
                    status_code = HTTPStatus.UNAUTHORIZED,
                    content = Response(
                        statusCode = HTTPStatus.UNAUTHORIZED,
                        message = "Invalid or expired token. Please login.",
                        payload = None
                    ).dict()
                )

            return await call_next(request)
        except Exception as e:
                return JSONResponse(
                    status_code = HTTPStatus.INTERNAL_SERVER_ERROR,
                    content = Response(
                        statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                        message = str(e),
                        payload = None
                    ).dict()
                )