from sqlalchemy.orm import Session
from repository.user_repository import UserRepository
from entity.user_entity import UserEntity
from dto.auth_dto import UserRegisterRequest, UserLoginRequest, UserUpdateRequest
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

    def update_profile(self, user_id: str, req: UserUpdateRequest):
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise ForbiddenException("Utilisateur introuvable.")
        
        if req.first_name is not None:
            user.first_name = req.first_name
        if req.last_name is not None:
            user.last_name = req.last_name
        if req.birth_date is not None:
            user.birth_date = req.birth_date
        if req.gender is not None:
            user.gender = req.gender

        # Synchroniser les informations du membre Patriarche dans ses arbres généalogiques
        from entity.family_membership_entity import FamilyMembershipEntity
        from entity.person_entity import PersonEntity
        from security.encryption import encrypt_value

        memberships = self.user_repo.db.query(FamilyMembershipEntity).filter(
            FamilyMembershipEntity.user_id == user.id,
            FamilyMembershipEntity.role == "PATRIARCH"
        ).all()

        for m in memberships:
            # Récupérer les membres de cette famille
            p = self.user_repo.db.query(PersonEntity).filter(
                PersonEntity.family_id == m.family_id
            ).first()
            if p:
                if req.first_name is not None:
                    p.first_name = req.first_name
                if req.last_name is not None:
                    p.last_name = req.last_name
                if req.birth_date is not None:
                    p.birth_date = encrypt_value(str(req.birth_date))
                if req.gender is not None:
                    p.gender = req.gender

        self.user_repo.db.commit()
        self.user_repo.db.refresh(user)
        return user

    def delete_account(self, user_id: str, password: str):
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise ForbiddenException("Utilisateur introuvable.")
        
        if not verify_password(password, user.password_hash):
            raise ForbiddenException("Mot de passe incorrect.")
        
        user.is_active = False
        self.user_repo.db.commit()
        return {"message": "Compte supprimé avec succès."}
