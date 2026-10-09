from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from config.database import get_db
from security.auth_dependencies import require_viewer, get_current_user
from service.family_service import FamilyService
from dto.family_dto import FamilyCreate, FamilyResponse

router = APIRouter(prefix="/family", tags=["Family Viewer"])

@router.get("/my-families")
def get_my_families(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = FamilyService(db)
    return service.get_my_families(current_user.id)

@router.get("/{family_id}/tree")
def get_family_tree(family_id: UUID, db: Session = Depends(get_db), role: str = Depends(require_viewer)):
    service = FamilyService(db)
    return service.get_family_tree_data(family_id)

@router.post("/", response_model=FamilyResponse)
def create_family(family: FamilyCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = FamilyService(db)
    return service.create_family(family.name, current_user.id)

@router.put("/{family_id}", response_model=FamilyResponse)
def update_family(family_id: UUID, family: FamilyCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = FamilyService(db)
    return service.update_family(family_id, family.name, current_user.id)

@router.delete("/{family_id}")
def delete_family(family_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = FamilyService(db)
    return service.soft_delete_family(family_id, current_user.id)
