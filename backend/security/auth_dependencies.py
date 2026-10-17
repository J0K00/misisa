from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config.database import get_db
from repository.user_repository import UserRepository
from security.jwt_handler import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if payload.get("is_guest"):
        from types import SimpleNamespace
        import uuid
        family_id = payload.get("family_id")
        role = payload.get("role", "VIEWER")
        return SimpleNamespace(
            id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
            family_id=uuid.UUID(family_id) if family_id else None,
            role=role,
            is_guest=True,
            session_id=payload.get("session_id"),
            first_name="Invité",
            last_name=f"({role.lower()})",
            email="guest@family.local"
        )

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_admin(current_user = Depends(get_current_user)):
    return current_user

def require_viewer(current_user = Depends(get_current_user)):
    return current_user
