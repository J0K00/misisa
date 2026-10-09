from sqlalchemy.orm import Session
from entity.family_entity import FamilyEntity
from entity.union_entity import UnionEntity, UnionChildrenEntity
from uuid import UUID

class FamilyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, family_id: UUID):
        return self.db.query(FamilyEntity).filter(FamilyEntity.id == family_id).first()

    def create(self, family: FamilyEntity) -> FamilyEntity:
        self.db.add(family)
        self.db.commit()
        self.db.refresh(family)
        return family

class UnionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(UnionEntity).all()

    def get_children(self):
        return self.db.query(UnionChildrenEntity).all()
