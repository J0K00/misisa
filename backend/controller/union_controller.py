from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from uuid import UUID

from config.database import get_db
from security.auth_dependencies import get_current_user
from security.jwt_handler import create_access_token
from service.union_service import UnionService
from dto.union_dto import UnionResponse, UnionCreate, UnionChildCreate

router = APIRouter(prefix="/unions", tags=["Unions"])

@router.post("/", response_model=UnionResponse)
def create_union(union: UnionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = UnionService(db)
    return service.create_union(union, current_user.id, current_user=current_user)

@router.post("/{union_id}/children")
def add_child(union_id: UUID, payload: UnionChildCreate, response: Response, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = UnionService(db)
    result = service.add_child(union_id, payload.child_id, current_user.id, current_user=current_user)

    # Si invité avec rôle EDITOR, basculer son token en VIEWER (usage unique)
    if getattr(current_user, "is_guest", False) and current_user.role == "EDITOR":
        new_viewer_token = create_access_token({
            "sub": "guest",
            "is_guest": True,
            "family_id": str(current_user.family_id),
            "role": "VIEWER"
        })
        response.headers["X-New-Token"] = new_viewer_token
        response.headers["X-New-Role"] = "VIEWER"

    return result
