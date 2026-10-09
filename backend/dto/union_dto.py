from pydantic import BaseModel
from typing import Optional
from datetime import date
from uuid import UUID

class UnionCreate(BaseModel):
    family_id: UUID
    partner_1_id: UUID
    partner_2_id: Optional[UUID] = None
    marriage_date: Optional[date] = None
    divorce_date: Optional[date] = None

class UnionResponse(BaseModel):
    id: UUID
    partner_1_id: UUID
    partner_2_id: Optional[UUID] = None
    marriage_date: Optional[date] = None
    divorce_date: Optional[date] = None

    class Config:
        from_attributes = True

class UnionChildCreate(BaseModel):
    child_id: UUID
