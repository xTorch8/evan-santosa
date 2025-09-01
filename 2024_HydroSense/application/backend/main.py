from fastapi import FastAPI, HTTPException,Request
import numpy as np
from pydantic import BaseModel
from middleware import log_requests
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from auth import router as auth_router
from dashboard import router as dashboard_router
from product import router as product_router
from superadmin import router as superadmin_router

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)

# Add the SlowAPI middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


app.include_router(auth_router, prefix="/auth")
app.include_router(dashboard_router, prefix="/dashboard")
app.include_router(product_router, prefix="/product")
app.include_router(superadmin_router, prefix="/superadmin")


# Apply Middleware
app.middleware("https")(log_requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to your needs
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/api")
@limiter.limit("50/minute")
async def root(request: Request):
    return {"message": "AI REST API is running"}



