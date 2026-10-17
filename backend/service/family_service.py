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

        from service.family_layout import apply_family_layout
        apply_family_layout(self.family_repo.db, family_id)

        persons = self.person_repo.get_by_family(family_id)
        person_ids = [p.id for p in persons]

        from entity.union_entity import UnionEntity, UnionChildrenEntity
        unions = self.family_repo.db.query(UnionEntity).filter(
            (UnionEntity.partner_1_id.in_(person_ids)) | (UnionEntity.partner_2_id.in_(person_ids))
        ).all()
        union_ids = [u.id for u in unions]
        children = self.family_repo.db.query(UnionChildrenEntity).filter(
            UnionChildrenEntity.union_id.in_(union_ids)
        ).all()
        
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

        # Generate random 16-character alphanumeric codes
        chars = string.ascii_uppercase + string.digits
        view_code = ''.join(random.choices(chars, k=16))
        edit_code = ''.join(random.choices(chars, k=16))
        code = ''.join(random.choices(chars, k=8)) # legacy invite_code
        new_family = FamilyEntity(name=name, invite_code=code, view_code=view_code, edit_code=edit_code)
        created = self.family_repo.create(new_family)

        if user_id:
            # Create the PATRIARCH membership
            membership = FamilyMembershipEntity(
                user_id=user_id,
                family_id=created.id,
                role="PATRIARCH"
            )
            self.family_repo.db.add(membership)

            # Fetch user to get name and profile details
            user = self.family_repo.db.query(UserEntity).filter(UserEntity.id == user_id).first()
            if user:
                from security.encryption import encrypt_value
                birth_val = str(user.birth_date) if user.birth_date else "1975-01-01"
                encrypted_birth = encrypt_value(birth_val)
                patriarch_gender = getattr(user, "gender", None) or "M"

                # Create the patriarch as a Person in the tree using their actual profile info
                patriarch_person = PersonEntity(
                    family_id=created.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    birth_date=encrypted_birth,
                    gender=patriarch_gender,
                    bio="Patriarche et fondateur de la famille.",
                    x=60,
                    y=60
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
                "role": m.role,
                "view_code": m.family.view_code,
                "edit_code": m.family.edit_code
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
