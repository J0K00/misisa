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

from dto.auth_dto import GuestLoginRequest, GuestLoginResponse
from entity.family_entity import FamilyEntity
from security.jwt_handler import create_access_token

@router.post("/guest-login", response_model=GuestLoginResponse)
def guest_login(req: GuestLoginRequest, db: Session = Depends(get_db)):
    clean_code = req.code.strip()
    family = db.query(FamilyEntity).filter(
        (FamilyEntity.view_code == clean_code) | (FamilyEntity.edit_code == clean_code),
        FamilyEntity.is_active == True
    ).first()

    if not family:
        raise HTTPException(status_code=404, detail="Code d'accès invalide ou famille introuvable.")

    role = "EDITOR" if family.edit_code == clean_code else "VIEWER"

    token = create_access_token({
        "sub": "guest",
        "is_guest": True,
        "family_id": str(family.id),
        "role": role
    })

    return GuestLoginResponse(
        access_token=token,
        token_type="bearer",
        role=role,
        family_id=family.id,
        family_name=family.name
    )
