from pydantic import BaseModel, computed_field
from typing import Optional, List
from datetime import date
from uuid import UUID
from dto.photo_dto import PhotoResponse

class PersonBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    death_date: Optional[date] = None
    gender: str
    bio: Optional[str] = None
    x: Optional[int] = 0
    y: Optional[int] = 0

class PersonCreate(PersonBase):
    family_id: UUID

class PersonResponse(PersonBase):
    id: UUID
    family_id: UUID
    photos: List[PhotoResponse] = []

    @computed_field
    def age(self) -> int:
        end_date = self.death_date if self.death_date else date.today()
        return end_date.year - self.birth_date.year - ((end_date.month, end_date.day) < (self.birth_date.month, self.birth_date.day))

    class Config:
        from_attributes = True
