from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from config.database import get_db
from security.auth_dependencies import get_current_user
from service.person_service import PersonService
from dto.person_dto import PersonResponse, PersonCreate, PersonUpdate

# Role suffix as requested
router = APIRouter(prefix="/persons", tags=["Person Admin"])

@router.post("/", response_model=PersonResponse)
def create_person(person: PersonCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    return service.create_person(person, current_user.id, current_user=current_user)

@router.put("/{person_id}", response_model=PersonResponse)
def update_person(person_id: UUID, person: PersonUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    return service.update_person(person_id, person, current_user.id, current_user=current_user)

@router.get("/family/{family_id}", response_model=List[PersonResponse])
def get_family_members(family_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    return service.get_family_members(family_id, current_user.id)
