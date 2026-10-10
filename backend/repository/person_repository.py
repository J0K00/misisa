from sqlalchemy.orm import Session
from entity.person_entity import PersonEntity
from dto.person_dto import PersonCreate
from uuid import UUID

class PersonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, person_id: UUID) -> PersonEntity:
        return self.db.query(PersonEntity).filter(PersonEntity.id == person_id).first()

    def get_by_family(self, family_id: UUID):
        return self.db.query(PersonEntity).filter(PersonEntity.family_id == family_id).all()

    def create(self, person: PersonCreate) -> PersonEntity:
        data = person.model_dump(exclude={"parent_union_id"})
        new_person = PersonEntity(**data)
        self.db.add(new_person)
        self.db.commit()
        self.db.refresh(new_person)
        return new_person
