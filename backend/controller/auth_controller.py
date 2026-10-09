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
