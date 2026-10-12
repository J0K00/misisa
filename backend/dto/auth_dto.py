from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class GuestLoginRequest(BaseModel):
    code: str

class GuestLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    family_id: UUID
    family_name: str
