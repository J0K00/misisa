from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, date
from typing import Optional
from pydantic import computed_field

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    gender: Optional[str] = "M"

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    birth_date: Optional[date] = None
    gender: Optional[str] = "M"
    is_active: bool
    created_at: datetime

    @computed_field
    def age(self) -> Optional[int]:
        if not self.birth_date:
            return None
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class GuestLoginRequest(BaseModel):
    code: str
    expected_role: Optional[str] = None

class GuestLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    family_id: UUID
    family_name: str
