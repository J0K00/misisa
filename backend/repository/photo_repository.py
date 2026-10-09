from sqlalchemy.orm import Session
from entity.photo_entity import PhotoEntity
from dto.photo_dto import PhotoBase
from uuid import UUID

class PhotoRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_by_person(self, person_id: UUID) -> int:
        return self.db.query(PhotoEntity).filter(PhotoEntity.person_id == person_id).count()

    def get_by_id_and_person(self, photo_id: UUID, person_id: UUID) -> PhotoEntity:
        return self.db.query(PhotoEntity).filter(
            PhotoEntity.id == photo_id, 
            PhotoEntity.person_id == person_id
        ).first()

    def create(self, person_id: UUID, photo: PhotoBase) -> PhotoEntity:
        new_photo = PhotoEntity(**photo.model_dump(), person_id=person_id)
        self.db.add(new_photo)
        self.db.commit()
        self.db.refresh(new_photo)
        return new_photo

    def delete(self, photo: PhotoEntity):
        self.db.delete(photo)
        self.db.commit()
