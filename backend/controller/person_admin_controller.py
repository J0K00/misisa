from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from config.database import get_db
from security.auth_dependencies import require_admin, require_viewer
from service.person_service import PersonService
from dto.person_dto import PersonResponse, PersonCreate

# Role suffix as requested
router = APIRouter(prefix="/persons", tags=["Person Admin"])

@router.post("/", response_model=PersonResponse)
def create_person(person: PersonCreate, db: Session = Depends(get_db), role: str = Depends(require_admin)):
    service = PersonService(db)
    return service.create_person(person)

@router.get("/family/{family_id}", response_model=List[PersonResponse])
def get_family_members(family_id: UUID, db: Session = Depends(get_db), role: str = Depends(require_viewer)):
    service = PersonService(db)
    return service.get_family_members(family_id)
