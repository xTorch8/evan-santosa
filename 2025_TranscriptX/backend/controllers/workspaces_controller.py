from fastapi import APIRouter, Depends
from sqlmodel import Session
from services.workspaces_service import WorkspacesService
from databases.dependencies import get_session
from models.requests.share_request import ShareRequest
from models.requests.get_workspace_detail_request import GetWorkspaceDetailRequest
from models.requests.export_workspace_request import ExportWorkspaceRequest
from models.requests.dashboard_request import DashboardFilterRequest
from models.requests.edit_request import EditRequest
from models.requests.delete_request import DeleteRequest
from models.responses.response import Response

router = APIRouter(prefix = "/api/workspaces", tags = ["Workspace"])

@router.post("/share")
async def share(request: ShareRequest, db: Session = Depends(get_session)):
    workspaces_service = WorkspacesService(db)
    return await workspaces_service.share(request)

@router.post("/detail")
async def getDetail(request: GetWorkspaceDetailRequest, db: Session = Depends(get_session)):
    workspaces_service = WorkspacesService(db)
    return await workspaces_service.getDetail(request)

@router.post("/export")
async def export(request: ExportWorkspaceRequest, db: Session = Depends(get_session)):
    workspace_services = WorkspacesService(db)
    return await workspace_services.export(request)

@router.post("/dashboard")
async def dashboard(request: DashboardFilterRequest, db: Session = Depends(get_session)):
    workspaces_service = WorkspacesService(db)
    return await workspaces_service.getDashboard(request)

@router.post("/edit")
async def edit(request: EditRequest, db: Session = Depends(get_session)):
    workspaces_service = WorkspacesService(db)
    return await workspaces_service.edit(request)

@router.post("/delete")
async def delete(request: DeleteRequest, db: Session = Depends(get_session)):
    workspaces_service = WorkspacesService(db)
    return await workspaces_service.delete(request)
