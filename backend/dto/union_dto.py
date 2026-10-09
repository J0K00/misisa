from pydantic import BaseModel
from typing import Optional
from datetime import date
from uuid import UUID

class UnionBase(BaseModel):
    partner_1_id: UUID
    partner_2_id: Optional[UUID] = None
    marriage_date: Optional[date] = None
    divorce_date: Optional[date] = None

class UnionResponse(UnionBase):
    id: UUID
    class Config:
        from_attributes = True

class UnionChildResponse(BaseModel):
    union_id: UUID
    child_id: UUID
    class Config:
        from_attributes = True
