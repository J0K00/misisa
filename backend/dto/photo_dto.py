from pydantic import BaseModel
from uuid import UUID

class PhotoBase(BaseModel):
    url: str
    public_id: str
    display_order: int = 0

class PhotoResponse(PhotoBase):
    id: UUID
    class Config:
        from_attributes = True
