from sqlalchemy.orm import Session
from entity.user_entity import UserEntity

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: UserEntity) -> UserEntity:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_email(self, email: str) -> UserEntity:
        return self.db.query(UserEntity).filter(UserEntity.email == email).first()

    def get_by_id(self, user_id: str) -> UserEntity:
        return self.db.query(UserEntity).filter(UserEntity.id == user_id).first()
