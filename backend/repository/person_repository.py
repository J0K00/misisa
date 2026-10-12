from sqlalchemy.orm import Session
from entity.person_entity import PersonEntity
from dto.person_dto import PersonCreate, PersonUpdate, PersonResponse
from uuid import UUID
from datetime import date
from security.encryption import encrypt_value, decrypt_value

def to_person_response(person: PersonEntity) -> PersonResponse:
    b_date = None
    if person.birth_date:
        dec = decrypt_value(person.birth_date)
        try:
            b_date = date.fromisoformat(dec)
        except Exception:
            b_date = dec

    d_date = None
    if person.death_date:
        dec = decrypt_value(person.death_date)
        try:
            d_date = date.fromisoformat(dec)
        except Exception:
            d_date = dec

    bio_val = decrypt_value(person.bio) if person.bio else None

    return PersonResponse(
        id=person.id,
        family_id=person.family_id,
        first_name=person.first_name,
        last_name=person.last_name,
        birth_date=b_date,
        death_date=d_date,
        gender=person.gender,
        bio=bio_val,
        x=person.x or 0,
        y=person.y or 0,
        photos=person.photos or []
    )

class PersonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, person_id: UUID) -> PersonEntity:
        return self.db.query(PersonEntity).filter(PersonEntity.id == person_id).first()

    def get_by_family(self, family_id: UUID):
        entities = self.db.query(PersonEntity).filter(PersonEntity.family_id == family_id).all()
        return [to_person_response(e) for e in entities]

    def create(self, person: PersonCreate) -> PersonEntity:
        data = person.model_dump(exclude={"parent_union_id"})
        if data.get("birth_date"):
            data["birth_date"] = encrypt_value(str(data["birth_date"]))
        if data.get("death_date"):
            data["death_date"] = encrypt_value(str(data["death_date"]))
        if data.get("bio"):
            data["bio"] = encrypt_value(data["bio"])

        new_person = PersonEntity(**data)
        self.db.add(new_person)
        self.db.commit()
        self.db.refresh(new_person)
        return new_person

    def update(self, person_entity: PersonEntity, update_dto: PersonUpdate) -> PersonEntity:
        update_data = update_dto.model_dump(exclude_unset=True)
        if "birth_date" in update_data and update_data["birth_date"]:
            update_data["birth_date"] = encrypt_value(str(update_data["birth_date"]))
        if "death_date" in update_data and update_data["death_date"]:
            update_data["death_date"] = encrypt_value(str(update_data["death_date"]))
        if "bio" in update_data and update_data["bio"]:
            update_data["bio"] = encrypt_value(update_data["bio"])

        for field, value in update_data.items():
            setattr(person_entity, field, value)

        self.db.commit()
        self.db.refresh(person_entity)
        return person_entity
