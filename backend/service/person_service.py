from sqlalchemy.orm import Session
from uuid import UUID
from repository.person_repository import PersonRepository
from exception.global_exceptions import NotFoundException
from dto.person_dto import PersonCreate

class PersonService:
    def __init__(self, db: Session):
        self.repo = PersonRepository(db)

    def get_family_members(self, family_id: UUID, user_id: UUID):
        # Todo: check if viewer
        return self.repo.get_by_family(family_id)

    def create_person(self, person: PersonCreate, user_id: UUID):
        from entity.family_membership_entity import FamilyMembershipEntity
        from exception.global_exceptions import ForbiddenException
        
        membership = self.repo.db.query(FamilyMembershipEntity).filter(
            FamilyMembershipEntity.family_id == person.family_id,
            FamilyMembershipEntity.user_id == user_id
        ).first()

        if not membership or membership.role not in ["PATRIARCH", "EDITOR"]:
            raise ForbiddenException("Droits insuffisants pour ajouter un membre.")
            
        # Auto-offset to prevent stacking
        from entity.person_entity import PersonEntity
        count = self.repo.db.query(PersonEntity).filter(PersonEntity.family_id == person.family_id).count()
        if person.x == 0 and person.y == 0:
            person.x = (count % 5) * 350
            person.y = (count // 5) * 200
            
        return self.repo.create(person)
