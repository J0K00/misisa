from sqlalchemy.orm import Session
from repository.user_repository import UserRepository
from entity.user_entity import UserEntity
from dto.auth_dto import UserRegisterRequest, UserLoginRequest
from security.jwt_handler import get_password_hash, verify_password, create_access_token
from exception.global_exceptions import BadRequestException, ForbiddenException

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, req: UserRegisterRequest):
        existing_user = self.user_repo.get_by_email(req.email)
        if existing_user:
            raise BadRequestException("Un compte existe déjà avec cet email.")
        
        hashed_pw = get_password_hash(req.password)
        new_user = UserEntity(
            email=req.email,
            password_hash=hashed_pw,
            first_name=req.first_name,
            last_name=req.last_name
        )
        created_user = self.user_repo.create(new_user)
        
        token = create_access_token({"sub": str(created_user.id)})
        return {"access_token": token, "token_type": "bearer", "user": created_user}

    def login(self, req: UserLoginRequest):
        user = self.user_repo.get_by_email(req.email)
        if not user or not user.is_active or not verify_password(req.password, user.password_hash):
            raise ForbiddenException("Email ou mot de passe incorrect ou compte désactivé.")
        
        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer", "user": user}

    def delete_account(self, user_id: str, password: str):
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise ForbiddenException("Utilisateur introuvable.")
        
        if not verify_password(password, user.password_hash):
            raise ForbiddenException("Mot de passe incorrect.")
        
        user.is_active = False
        self.user_repo.db.commit()
        return {"message": "Compte supprimé avec succès."}
