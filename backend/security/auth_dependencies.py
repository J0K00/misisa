from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config.database import get_db
from repository.user_repository import UserRepository
from security.jwt_handler import decode_token
from exception.global_exceptions import ForbiddenException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        raise ForbiddenException("Token invalide ou expiré")
    
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(payload.get("sub"))
    if not user:
        raise ForbiddenException("Utilisateur introuvable")
    return user

def require_admin(current_user = Depends(get_current_user)):
    return current_user

def require_viewer(current_user = Depends(get_current_user)):
    return current_user
