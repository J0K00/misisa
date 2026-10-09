from sqlalchemy.orm import Session
from uuid import UUID
from entity.union_entity import UnionEntity
from dto.union_dto import UnionCreate
from exception.global_exceptions import ForbiddenException, NotFoundException

class UnionService:
    def __init__(self, db: Session):
        self.db = db

    def create_union(self, union_dto: UnionCreate, user_id: UUID):
        from entity.family_membership_entity import FamilyMembershipEntity
        
        # Check permissions
        membership = self.db.query(FamilyMembershipEntity).filter(
            FamilyMembershipEntity.family_id == union_dto.family_id,
            FamilyMembershipEntity.user_id == user_id
        ).first()

        if not membership or membership.role not in ["PATRIARCH", "EDITOR"]:
            raise ForbiddenException("Droits insuffisants pour créer une union dans cette famille.")

        union = UnionEntity(
            partner_1_id=union_dto.partner_1_id,
            partner_2_id=union_dto.partner_2_id,
            marriage_date=union_dto.marriage_date,
            divorce_date=union_dto.divorce_date
        )
        self.db.add(union)
        self.db.commit()
        self.db.refresh(union)
        return union

    def add_child(self, union_id: UUID, child_id: UUID, user_id: UUID):
        from entity.family_membership_entity import FamilyMembershipEntity
        from entity.union_entity import UnionChildrenEntity, UnionEntity
        
        # We need the family_id to check permissions. Get it from the union's partner_1
        from entity.person_entity import PersonEntity
        union = self.db.query(UnionEntity).filter(UnionEntity.id == union_id).first()
        if not union:
            raise NotFoundException("Union introuvable.")
            
        p1 = self.db.query(PersonEntity).filter(PersonEntity.id == union.partner_1_id).first()
        if not p1:
            raise NotFoundException("Partenaire introuvable.")
            
        # Check permissions
        membership = self.db.query(FamilyMembershipEntity).filter(
            FamilyMembershipEntity.family_id == p1.family_id,
            FamilyMembershipEntity.user_id == user_id
        ).first()

        if not membership or membership.role not in ["PATRIARCH", "EDITOR"]:
            raise ForbiddenException("Droits insuffisants pour ajouter une naissance.")
            
        union_child = UnionChildrenEntity(union_id=union_id, child_id=child_id)
        self.db.add(union_child)
        self.db.commit()
        return {"message": "Enfant ajouté à l'union avec succès"}
