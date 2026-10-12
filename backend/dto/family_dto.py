from pydantic import BaseModel
from uuid import UUID
from datetime import date
from typing import Optional

class FamilyBase(BaseModel):
    name: str

class FamilyCreate(FamilyBase):
    pass

class FamilyResponse(FamilyBase):
    id: UUID
    invite_code: Optional[str] = None
    view_code: Optional[str] = None
    edit_code: Optional[str] = None
    created_at: date

    class Config:
        from_attributes = True
