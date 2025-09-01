from repositories.tools_repository import ToolsRepository
from sqlmodel import Session
from models.requests.transcript_request import TranscriptRequest
from models.requests.summarize_request import SummarizeRequest
from models.requests.share_request import ShareRequest
from models.responses.response import Response
from utils.base64_utils import get_file_extension, get_file_size
from http import HTTPStatus
from dotenv import load_dotenv
import os

class ToolsService:
    def __init__(self, db: Session):
        load_dotenv()
        self.db = db
        self.tools_repository = ToolsRepository(db)
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE_MB"))

    async def transcript(self, request: TranscriptRequest):
        try:
            if request.userID is None or request.file is None:
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "Invalid model state",
                    payload = None 
                )
            
            file_size = get_file_size(request.file)
            if file_size >= (self.max_file_size * 1024 * 1024):
                return Response(
                    statusCode = HTTPStatus.CONTENT_TOO_LARGE,
                    message = f"File is too large. File must be less than {self.max_file_size} MB.",
                    payload = None
                )

            file_extension = get_file_extension(request.file)
            if file_extension not in [".wav", ".mp3", ".mp4", ".mpeg"]:
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "File must be in .wav, .mp3, .mp4, or .mpeg format.",
                    payload = None
                )

            return await self.tools_repository.transcript(
                request = request, 
                file_extension = file_extension
            )
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )
    
    async def summarize(self, request: SummarizeRequest):
        try:
            if request.userID is None:
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "Invalid model state",
                    payload = None 
                )

            if request.workspaceID is not None:
                return await self.tools_repository.summarize(
                    request = request,
                    file_extension = None
                )
            elif request.file is not None:
                file_size = get_file_size(request.file)
                if file_size >= (self.max_file_size * 1024 * 1024):
                    return Response(
                        statusCode = HTTPStatus.CONTENT_TOO_LARGE,
                        message = f"File is too large. File must be less than {self.max_file_size} MB.",
                        payload = None
                    )

                file_extension = get_file_extension(request.file)
                if file_extension not in [".txt", ".docx", ".pdf"]:
                    return Response(
                        statusCode = HTTPStatus.BAD_REQUEST,
                        message = "File must be in .txt, .docx, or .pdf format.",
                        payload = None
                    )

                return await self.tools_repository.summarize(
                    request = request,
                    file_extension = file_extension
                )
            else:
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "Invalid model state",
                    payload = None
                )
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )