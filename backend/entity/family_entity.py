from sqlalchemy import Column, String, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from entity.base import Base

class FamilyEntity(Base):
    __tablename__ = "families"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True)
    invite_code = Column(String(8), unique=True, index=True)
    created_at = Column(Date, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
