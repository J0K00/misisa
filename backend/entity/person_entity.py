from sqlalchemy import Column, String, ForeignKey, Date, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from entity.base import Base

class PersonEntity(Base):
    __tablename__ = "persons"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"))
    first_name = Column(String)
    last_name = Column(String)
    birth_date = Column(Date)
    death_date = Column(Date, nullable=True)
    gender = Column(String(1))
    bio = Column(String, nullable=True)
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    
    photos = relationship("PhotoEntity", back_populates="person", cascade="all, delete-orphan")
