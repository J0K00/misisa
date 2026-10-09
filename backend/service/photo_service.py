import cloudinary.uploader
from sqlalchemy.orm import Session
from uuid import UUID
from repository.photo_repository import PhotoRepository
from repository.person_repository import PersonRepository
from exception.global_exceptions import NotFoundException, BadRequestException
from dto.photo_dto import PhotoBase

class PhotoService:
    def __init__(self, db: Session):
        self.photo_repo = PhotoRepository(db)
        self.person_repo = PersonRepository(db)

    def add_photo(self, person_id: UUID, photo: PhotoBase):
        person = self.person_repo.get_by_id(person_id)
        if not person:
            raise NotFoundException("Membre introuvable")

        if self.photo_repo.count_by_person(person_id) >= 10:
            raise BadRequestException("Limite de 10 photos atteinte pour ce membre")

        return self.photo_repo.create(person_id, photo)

    def delete_photo(self, person_id: UUID, photo_id: UUID):
        photo = self.photo_repo.get_by_id_and_person(photo_id, person_id)
        if not photo:
            raise NotFoundException("Photo introuvable")

        try:
            cloudinary.uploader.destroy(photo.public_id)
        except Exception as e:
            print(f"Erreur de suppression Cloudinary: {e}")

        self.photo_repo.delete(photo)
