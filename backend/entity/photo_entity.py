from sqlalchemy import Column, String, ForeignKey, Date, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from entity.base import Base

class PhotoEntity(Base):
    __tablename__ = "person_photos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"))
    url = Column(String)
    public_id = Column(String)
    display_order = Column(Integer, default=0)
    created_at = Column(Date, default=datetime.utcnow)

    person = relationship("PersonEntity", back_populates="photos")
