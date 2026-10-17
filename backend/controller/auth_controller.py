from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from dto.auth_dto import UserRegisterRequest, UserLoginRequest, TokenResponse
from service.auth_service import AuthService
import traceback

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    try:
        service = AuthService(db)
        return service.register(req)
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    try:
        service = AuthService(db)
        return service.login(req)
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class DeleteAccountRequest(BaseModel):
    password: str

from security.auth_dependencies import get_current_user
@router.delete("/me")
def delete_account(req: DeleteAccountRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        service = AuthService(db)
        return service.delete_account(str(current_user.id), req.password)
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

from dto.auth_dto import GuestLoginRequest, GuestLoginResponse, UserUpdateRequest, UserResponse
from entity.family_entity import FamilyEntity
from security.jwt_handler import create_access_token

@router.put("/me", response_model=UserResponse)
def update_profile(req: UserUpdateRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        service = AuthService(db)
        return service.update_profile(str(current_user.id), req)
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/guest-login", response_model=GuestLoginResponse)
def guest_login(req: GuestLoginRequest, db: Session = Depends(get_db)):
    clean_code = req.code.strip()

    if req.expected_role == "VIEWER":
        family = db.query(FamilyEntity).filter(
            FamilyEntity.view_code == clean_code,
            FamilyEntity.is_active == True
        ).first()
        if not family:
            edit_family = db.query(FamilyEntity).filter(FamilyEntity.edit_code == clean_code, FamilyEntity.is_active == True).first()
            if edit_family:
                raise HTTPException(status_code=400, detail="Ce code est un code d'Éditeur. Il ne peut pas être utilisé dans l'espace Lecteur.")
            raise HTTPException(status_code=404, detail="Code de lecture invalide ou famille introuvable.")
        role = "VIEWER"

    elif req.expected_role == "EDITOR":
        family = db.query(FamilyEntity).filter(
            FamilyEntity.edit_code == clean_code,
            FamilyEntity.is_active == True
        ).first()
        if not family:
            view_family = db.query(FamilyEntity).filter(FamilyEntity.view_code == clean_code, FamilyEntity.is_active == True).first()
            if view_family:
                raise HTTPException(status_code=400, detail="Ce code est un code de Lecture seule. Il ne peut pas être utilisé dans l'espace Éditeur.")
            raise HTTPException(status_code=404, detail="Code d'édition invalide ou famille introuvable.")
        role = "EDITOR"

    else:
        family = db.query(FamilyEntity).filter(
            (FamilyEntity.view_code == clean_code) | (FamilyEntity.edit_code == clean_code),
            FamilyEntity.is_active == True
        ).first()
        if not family:
            raise HTTPException(status_code=404, detail="Code d'accès invalide ou famille introuvable.")
        role = "EDITOR" if family.edit_code == clean_code else "VIEWER"

    import uuid
    session_id = str(uuid.uuid4())
    token = create_access_token({
        "sub": "guest",
        "is_guest": True,
        "family_id": str(family.id),
        "role": role,
        "session_id": session_id
    })

    return GuestLoginResponse(
        access_token=token,
        token_type="bearer",
        role=role,
        family_id=family.id,
        family_name=family.name
    )

@router.post("/guest-downgrade")
def downgrade_guest(current_user = Depends(get_current_user)):
    if not getattr(current_user, "is_guest", False):
        raise HTTPException(status_code=400, detail="Action réservée aux sessions invités.")
    
    from security.session_tracker import mark_session_used
    session_id = getattr(current_user, "session_id", None)
    if session_id:
        mark_session_used(session_id)

    token = create_access_token({
        "sub": "guest",
        "is_guest": True,
        "family_id": str(current_user.family_id),
        "role": "VIEWER"
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "VIEWER"
    }

