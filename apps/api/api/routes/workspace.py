from fastapi import APIRouter, HTTPException

from memory.persistence import create_workspace, get_workspace
from schemas.workspace import WorkspaceCreateRequest, WorkspaceResponse

router = APIRouter()


@router.post("/create", response_model=WorkspaceResponse)
async def create_workspace_route(request: WorkspaceCreateRequest) -> WorkspaceResponse:
    return create_workspace(request.company_id)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace_route(workspace_id: str) -> WorkspaceResponse:
    workspace = get_workspace(workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace
