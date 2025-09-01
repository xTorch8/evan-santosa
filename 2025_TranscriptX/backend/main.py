from fastapi import FastAPI
# from pipelines.summarization_pipeline import model, tokenizer
# from pipelines.transcription_pipeline import model, processor
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from databases.database import create_db_and_tables
from controllers.tools_controller import router as tools_router
from controllers import auth_controller
from controllers.workspaces_controller import router as workspaces_router
from middlewares.auth_middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    max_request_size = 256 * 1024 * 1024
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title = "TranscriptX",
        version = "1.0.0",
        routes = app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema
 
app.openapi = custom_openapi

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.add_middleware(AuthMiddleware)

app.include_router(tools_router)
app.include_router(workspaces_router)
app.include_router(auth_controller.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

