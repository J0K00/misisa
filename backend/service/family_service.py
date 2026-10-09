from sqlalchemy.orm import Session
from uuid import UUID
from repository.family_repository import FamilyRepository, UnionRepository
from repository.person_repository import PersonRepository
from exception.global_exceptions import NotFoundException

class FamilyService:
    def __init__(self, db: Session):
        self.family_repo = FamilyRepository(db)
        self.union_repo = UnionRepository(db)
        self.person_repo = PersonRepository(db)

    def get_family_tree_data(self, family_id: UUID):
        family = self.family_repo.get_by_id(family_id)
        if not family:
            raise NotFoundException("Famille introuvable")
        
        persons = self.person_repo.get_by_family(family_id)
        unions = self.union_repo.get_all()
        children = self.union_repo.get_children()
        
        return {
            "family": family,
            "persons": persons,
            "unions": unions,
            "children": children
        }

    def create_family(self, name: str, user_id: UUID = None):
        import uuid
        import string
        import random
        from datetime import date
        from entity.family_entity import FamilyEntity
        from entity.family_membership_entity import FamilyMembershipEntity
        from entity.person_entity import PersonEntity
        from entity.user_entity import UserEntity

        # Generate random invite code
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        new_family = FamilyEntity(name=name, invite_code=code)
        created = self.family_repo.create(new_family)

        if user_id:
            # Create the PATRIARCH membership
            membership = FamilyMembershipEntity(
                user_id=user_id,
                family_id=created.id,
                role="PATRIARCH"
            )
            self.family_repo.db.add(membership)

            # Fetch user to get name
            user = self.family_repo.db.query(UserEntity).filter(UserEntity.id == user_id).first()
            if user:
                # Create the patriarch as a Person in the tree
                patriarch_person = PersonEntity(
                    family_id=created.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    birth_date=date(1970, 1, 1), # Default date
                    gender="M", # Default
                    x=0,
                    y=0
                )
                self.family_repo.db.add(patriarch_person)

            self.family_repo.db.commit()

        return created

    def get_my_families(self, user_id: UUID):
        from entity.family_membership_entity import FamilyMembershipEntity
        from entity.family_entity import FamilyEntity
        
        # Join memberships with families, filtering out inactive families
        memberships = self.family_repo.db.query(FamilyMembershipEntity).join(FamilyEntity).filter(
            FamilyMembershipEntity.user_id == user_id,
            FamilyEntity.is_active == True
        ).all()
        
        result = []
        for m in memberships:
            result.append({
                "id": m.family.id,
                "name": m.family.name,
                "role": m.role
            })
        return result

    def update_family(self, family_id: UUID, new_name: str, user_id: UUID):
        from entity.family_membership_entity import FamilyMembershipEntity
        from exception.global_exceptions import ForbiddenException
        
        membership = self.family_repo.db.query(FamilyMembershipEntity).filter(
            FamilyMembershipEntity.family_id == family_id,
            FamilyMembershipEntity.user_id == user_id
        ).first()

        if not membership or membership.role != "PATRIARCH":
            raise ForbiddenException("Seul le Patriarche peut modifier cette famille.")
            
        family = self.family_repo.get_by_id(family_id)
        if not family or not family.is_active:
            raise NotFoundException("Famille introuvable.")
            
        family.name = new_name
        self.family_repo.db.commit()
        return family

    def soft_delete_family(self, family_id: UUID, user_id: UUID):
        from entity.family_membership_entity import FamilyMembershipEntity
        from exception.global_exceptions import ForbiddenException
        
        membership = self.family_repo.db.query(FamilyMembershipEntity).filter(
            FamilyMembershipEntity.family_id == family_id,
            FamilyMembershipEntity.user_id == user_id
        ).first()

        if not membership or membership.role != "PATRIARCH":
            raise ForbiddenException("Seul le Patriarche peut supprimer cette famille.")
            
        family = self.family_repo.get_by_id(family_id)
        if not family or not family.is_active:
            raise NotFoundException("Famille introuvable.")
            
        family.is_active = False
        self.family_repo.db.commit()
        return {"message": "Famille supprimée avec succès."}
