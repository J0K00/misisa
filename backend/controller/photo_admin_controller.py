from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from config.database import get_db
from security.auth_dependencies import require_admin
from service.photo_service import PhotoService
from dto.photo_dto import PhotoResponse, PhotoBase

router = APIRouter(prefix="/persons/{person_id}/photos", tags=["Photo Admin"])

@router.post("/", response_model=PhotoResponse)
def add_photo(person_id: UUID, photo: PhotoBase, db: Session = Depends(get_db), role: str = Depends(require_admin)):
    service = PhotoService(db)
    return service.add_photo(person_id, photo)

@router.delete("/{photo_id}")
def delete_photo(person_id: UUID, photo_id: UUID, db: Session = Depends(get_db), role: str = Depends(require_admin)):
    service = PhotoService(db)
    service.delete_photo(person_id, photo_id)
    return {"status": "success", "message": "Photo supprimée"}
