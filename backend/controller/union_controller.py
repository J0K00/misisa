from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from config.database import get_db
from security.auth_dependencies import get_current_user
from service.union_service import UnionService
from dto.union_dto import UnionResponse, UnionCreate, UnionChildCreate

router = APIRouter(prefix="/unions", tags=["Unions"])

@router.post("/", response_model=UnionResponse)
def create_union(union: UnionCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = UnionService(db)
    return service.create_union(union, current_user.id)

@router.post("/{union_id}/children")
def add_child(union_id: UUID, payload: UnionChildCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = UnionService(db)
    return service.add_child(union_id, payload.child_id, current_user.id)
