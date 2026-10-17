from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from config.database import get_db
from security.auth_dependencies import get_current_user
from security.jwt_handler import create_access_token
from service.person_service import PersonService
from dto.person_dto import PersonResponse, PersonCreate, PersonUpdate

# Role suffix as requested
router = APIRouter(prefix="/persons", tags=["Person Admin"])

@router.post("/", response_model=PersonResponse)
def create_person(person: PersonCreate, response: Response, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    result = service.create_person(person, current_user.id, current_user=current_user)
    
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

@router.put("/{person_id}", response_model=PersonResponse)
def update_person(person_id: UUID, person: PersonUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    return service.update_person(person_id, person, current_user.id, current_user=current_user)

@router.get("/family/{family_id}", response_model=List[PersonResponse])
def get_family_members(family_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    return service.get_family_members(family_id, current_user.id)
