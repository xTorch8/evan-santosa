from fastapi import APIRouter, Depends
from sqlmodel import Session
from services.tools_service import ToolsService
from databases.dependencies import get_session
from models.requests.transcript_request import TranscriptRequest
from models.requests.summarize_request import SummarizeRequest

router = APIRouter(prefix = "/api/tools", tags = ["Tools"])

@router.post("/transcript")
async def transcript(request: TranscriptRequest, db: Session = Depends(get_session)):
    tools_service = ToolsService(db)
    return await tools_service.transcript(request)

@router.post("/summarize")
async def summarize(request: SummarizeRequest, db: Session = Depends(get_session)):
    tools_service = ToolsService(db)
    return await tools_service.summarize(request)