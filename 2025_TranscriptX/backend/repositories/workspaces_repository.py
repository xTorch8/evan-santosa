from sqlmodel import Session, select
from databases.tr_workspace import TrWorkspace
from databases.tr_workspace_detail import TrWorkspaceDetail
from models.requests.share_request import ShareRequest
from models.requests.get_workspace_detail_request import GetWorkspaceDetailRequest
from models.requests.export_workspace_request import ExportWorkspaceRequest
from models.responses.response import Response
from models.responses.share_response import ShareResult
from models.responses.get_workspace_detail_response import GetWorkspaceDetailResult
from models.requests.dashboard_request import DashboardFilterRequest
from models.responses.dashboard_response import DashboardHistoryItem
from models.requests.edit_request import EditRequest
from models.requests.delete_request import DeleteRequest
from utils.base64_utils import get_file_extension
from fastapi.responses import StreamingResponse
from http import HTTPStatus
from dotenv import load_dotenv
from xhtml2pdf import pisa
from io import BytesIO
import uuid
import os
import asyncio
import traceback
from typing import List
from sqlalchemy import or_, not_
from datetime import datetime, timedelta

class WorkspacesRepository:
    def __init__(self, db: Session):
        load_dotenv()
        self.db = db
        self.client_url = os.getenv("CLIENT_URL")

    async def share(self, request: ShareRequest):
        try:
            workspace = self.db.exec(
                select(TrWorkspace)
                .where(
                    TrWorkspace.workspaceID == request.workspaceID,
                    TrWorkspace.isActive == True
                )
            ).first()

            if workspace is None:
                return Response(
                    statusCode = HTTPStatus.NOT_FOUND,
                    message = "Workspace is not found",
                    payload = None 
                )
            
            if request.isGrantAccess:
                workspace.link = f"{self.client_url}/workspace/{workspace.workspaceID}"
            else:
                workspace.link = None

            workspace.dateUp = datetime.utcnow()
            self.db.commit()

            return Response[ShareResult](
                statusCode = HTTPStatus.CREATED,
                message = None,
                payload = ShareResult(
                    link = workspace.link
                )
            ) 
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )
        
    async def getDetail(self, request: GetWorkspaceDetailRequest):
        try:
            workspace = self.db.exec(
                select(TrWorkspace)
                .where(
                    TrWorkspace.workspaceID == request.workspaceID,
                    TrWorkspace.isActive == True
                )
            ).first()

            if workspace is None:
                return Response(
                    statusCode = HTTPStatus.NOT_FOUND,
                    message = "Workspace not found",
                    payload = None
                )
            
            if workspace.userID != request.userID and workspace.link is None:
                return Response(
                    statusCode = HTTPStatus.NOT_FOUND,
                    message = "Workspace not found",
                    payload = None
                )

            transcription = None
            summarization = None 
            for wd in workspace.workspaceDetail:
                if wd.toolsID == 1:
                    summarization = wd.result
                elif wd.toolsID == 2:
                    transcription = wd.result

            type = None
            if transcription is None and summarization is not None:
                type = "Summarization"
            elif transcription is not None and summarization is None:
                type = "Transcription"
            elif transcription is not None and summarization is not None:
                type = "Transcription and Summarization"
            else:
                return Response(
                    statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                    message = "Workspace error",
                    payload = None
                )

            payload = GetWorkspaceDetailResult(
                title = workspace.name,
                author = workspace.user.name,
                createdDate = workspace.dateIn,
                type = type,
                fileName = f"{request.workspaceID}{get_file_extension(workspace.file)}",
                file = workspace.file,
                sharedLink = workspace.link,
                description = workspace.description,
                transcription = transcription,
                summarization = summarization,
                isShareable = (workspace.link == None),
                isCanSummarized = (transcription is not None and summarization is None)
            )

            if workspace.userID != request.userID:
                payload.isShareable = False
                payload.isCanSummarized = False

            return Response[GetWorkspaceDetailResult](
                statusCode = HTTPStatus.OK,
                message = None,
                payload = payload
            )
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )
        
    async def export(self, request: ExportWorkspaceRequest):
        try:
            workspace = self.db.exec(
                select(TrWorkspace)
                .where(
                    TrWorkspace.workspaceID == request.workspaceID,
                    TrWorkspace.isActive == True
                )
            ).first()

            if workspace is None:
                return Response(
                    statusCode = HTTPStatus.NOT_FOUND,
                    message = "Workspace is not found",
                    payload = None
                )
            
            transcription = None
            summarization = None 
            for wd in workspace.workspaceDetail:
                if wd.toolsID == 1:
                    summarization = wd.result
                elif wd.toolsID == 2:
                    transcription = wd.result

            type = None
            if transcription is None and summarization is not None:
                type = "Summarization"
            elif transcription is not None and summarization is None:
                type = "Transcription"
            elif transcription is not None and summarization is not None:
                type = "Transcription and Summarization"
            else:
                return Response(
                    statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                    message = "Workspace error",
                    payload = None
                )
                                
            html_template = """
                <html>
                    <head>
                        <style>
                            @page {
                                size: A4 portrait;
                                margin: 2cm;
                            }
                        
                            body {
                                font-family: "Times New Roman", Times, serif;
                            }
                            
                            #workspace-title {
                                text-align: center;
                            }
                            
                            table {
                                margin-top: 3rem;
                                margin-bottom: 3rem;
                                width: 100%;
                            }
                            
                            
                            .container {
                                background-color: #f1f5f9;
                                margin-top: 0rem; 
                                padding-top: 0.25rem;
                                padding-bottom: 0.25rem;
                                padding-left: 0.5rem;
                                padding-right: 0.5rem;
                                width: 100%;
                            }
                            
                            .container p {
                                text-align: justified;
                                width: 100%;
                                white-space: normal;
                            }
                            
                            .mb-0 {
                                margin-bottom: 0rem;
                            }
                        </style>
                    </head>
                    <body>
                        <h1 id="workspace-title">[[WORKSPACE_TITLE]]</h1>

                        <table>
                            <thead>
                                
                            </thead>
                            <tbody>
                                <tr>
                                    <td width="20%"> Author </td>
                                    <td width="80%"> : [[AUTHOR]] </td>
                                </tr>
                                <tr>
                                    <td> Created Date </td>
                                    <td> : [[CREATED_DATE]] </td>
                                </tr>  
                                <tr>
                                    <td> Type </td>
                                    <td> : [[TYPE]] </td>
                                </tr>  
                                <tr>
                                    <td> Link </td>
                                    <td> : [[LINK]] </td>
                                </tr>      
                                <tr>
                                    <td> Description </td>
                                    <td> : [[DESCRIPTION]] </td>
                                </tr>
                            </tbody>
                        </table>       
                        
                        <p class="mb-0"> Transcription: </p>
                        <div class="container">
                            <p> [[TRANSCRIPTION]] </p>
                        </div>
                        
                        <p class="mb-0"> Summary: </p>
                        <div class="container">
                            <p> [[SUMMARY]] </p>
                        </div>                        
                    </body>
                </html>             
            """

            html_template = html_template \
                .replace("[[WORKSPACE_TITLE]]", workspace.name if workspace.name is not None else f"{workspace.user.name}'s Workspace") \
                .replace("[[AUTHOR]]", workspace.user.name) \
                .replace("[[CREATED_DATE]]", workspace.dateIn.strftime("%Y-%m-%d")) \
                .replace("[[TYPE]]", type) \
                .replace("[[LINK]]", workspace.link if workspace.link is not None else "-") \
                .replace("[[DESCRIPTION]]", workspace.description if workspace.description is not None else "-") \
                .replace("[[TRANSCRIPTION]]", transcription if transcription is not None else "-") \
                .replace("[[SUMMARY]]", summarization if summarization is not None else "-")
        
            pdf_io = BytesIO()          

            pisa_status = pisa.CreatePDF(html_template, dest = pdf_io)

            if pisa_status.err:
                return Response(
                    statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                    message = "Error when generating PDF",
                    payload = None
                )

            pdf_io.seek(0)

            print(pdf_io)

            return StreamingResponse(
                pdf_io,
                media_type = "application/pdf",
                headers = {"Content-Disposition": f"attachment; filename={workspace.workspaceID}.pdf"}
            )
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(traceback.format_exc()),
                payload = None
            )
    
    async def getDashboard(self, request: DashboardFilterRequest):
        try:
            query = select(TrWorkspace).where(
                TrWorkspace.userID == request.userID,
                TrWorkspace.isActive == True
            )

            if request.startDate:
                query = query.where(TrWorkspace.dateIn >= request.startDate)
            if request.endDate:
                end_date = request.endDate + timedelta(days = 1) - timedelta(microseconds=1)
                query = query.where(TrWorkspace.dateIn <= end_date)

            if request.type:
                if request.type.lower() == "transcription":
                    query = query.where(
                        TrWorkspace.workspaceDetail.any(TrWorkspaceDetail.toolsID == 2),
                        not_(TrWorkspace.workspaceDetail.any(TrWorkspaceDetail.toolsID == 1))
                    )
                elif request.type.lower() == "summarization":
                    query = query.where(
                        TrWorkspace.workspaceDetail.any(TrWorkspaceDetail.toolsID == 1),
                        not_(TrWorkspace.workspaceDetail.any(TrWorkspaceDetail.toolsID == 2))
                    )
                elif request.type.lower() == "transcription and summarization":
                    query = query.where(
                        TrWorkspace.workspaceDetail.any(TrWorkspaceDetail.toolsID == 1),
                        TrWorkspace.workspaceDetail.any(TrWorkspaceDetail.toolsID == 2)
                    )

            if request.sharedStatus is not None:
                if request.sharedStatus:
                    query = query.where(TrWorkspace.link.is_not(None))
                else:
                    query = query.where(TrWorkspace.link.is_(None))

            results = self.db.exec(query).all()

            items: List[DashboardHistoryItem] = []

            for workspace in results:
                transcription = any(d.toolsID == 2 for d in workspace.workspaceDetail)
                summarization = any(d.toolsID == 1 for d in workspace.workspaceDetail)

                if request.search:
                    if request.search.lower() not in (workspace.name or "").lower() and request.search.lower() not in (workspace.link or "").lower() and request.search.lower() not in (workspace.description or "").lower():
                        continue

                item = DashboardHistoryItem(
                    workspaceID = workspace.workspaceID,
                    title = workspace.name,
                    description = workspace.description,
                    createdDate = workspace.dateIn,
                    type = (
                        "Transcription and Summarization" if transcription and summarization else
                        "Transcription" if transcription else
                        "Summarization" if summarization else
                        "-"
                    ),
                    isShared = workspace.link is not None,
                    fileName = f"{workspace.workspaceID}{get_file_extension(workspace.file)}",
                    link = workspace.link
                )
                items.append(item)

            if request.sortBy:
                reverse = request.sortOrder == "desc"
                if request.sortBy == "title":
                    items.sort(key = lambda x: (x.title or "").lower(), reverse = reverse)
                elif request.sortBy == "description":
                    items.sort(key = lambda x: (x.description or "").lower(), reverse = reverse)
                elif request.sortBy == "createdDate":
                    items.sort(key = lambda x: x.createdDate, reverse = reverse)
                elif request.sortBy == "type":
                    items.sort(key = lambda x: (x.type or "").lower(), reverse = reverse)
                elif request.sortBy == "url":
                    items.sort(key = lambda x: (x.link or "").lower(), reverse = reverse)

            return Response[List[DashboardHistoryItem]](
                statusCode = HTTPStatus.OK,
                message = None,
                payload = items
            )

        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(traceback.format_exc()),
                payload = None
            )

    async def edit(self, request: EditRequest):
        try:
            workspace = self.db.exec(
                select(TrWorkspace)
                .where(
                    TrWorkspace.workspaceID == request.workspaceID,
                    TrWorkspace.isActive == True
                )
            ).first()

            if workspace is None:
                return Response(
                    statusCode=HTTPStatus.NOT_FOUND,
                    message="Workspace not found",
                    payload=None
                )

            if workspace.userID != request.userID:
                return Response(
                    statusCode=HTTPStatus.FORBIDDEN,
                    message="You are not authorized to edit this workspace",
                    payload=None
                )

            workspace.name = request.title
            workspace.description = request.description
            
            if request.shared is False:
                workspace.link = None
            else:
                workspace.link = f"{self.client_url}/workspace/{workspace.workspaceID}"


            workspace.dateUp = datetime.utcnow()
            self.db.commit()

            return Response(
                statusCode=HTTPStatus.OK,
                message="Workspace updated successfully",
                payload=None
            )
        except Exception as e:
            return Response(
                statusCode=HTTPStatus.INTERNAL_SERVER_ERROR,
                message=str(e),
                payload=None
            )
            
    async def delete(self, request: DeleteRequest):
        try:
            for workspaceID in request.workspaceID:
                workspace = self.db.get(TrWorkspace, workspaceID)
                if workspace.userID != request.userID:
                    return Response(
                        statusCode = HTTPStatus.FORBIDDEN,
                        message = "You are not authorized to delete this workspace",
                        payload = None
                    )
                
                if workspace and workspace.isActive:
                    workspace.isActive = False
                    workspace.dateUp = datetime.utcnow()

            self.db.commit()
            
            return Response(
                statusCode = HTTPStatus.NO_CONTENT,
                message = "Workspace deleted succesfully",
                payload = None
            )        
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )

