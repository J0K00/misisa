from sqlalchemy.orm import Session
from uuid import UUID
from repository.person_repository import PersonRepository
from exception.global_exceptions import NotFoundException
from dto.person_dto import PersonCreate

class PersonService:
    def __init__(self, db: Session):
        self.repo = PersonRepository(db)

    def get_family_members(self, family_id: UUID):
        return self.repo.get_by_family(family_id)

    def create_person(self, person: PersonCreate):
        return self.repo.create(person)
