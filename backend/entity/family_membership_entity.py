from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .base import Base

class FamilyMembershipEntity(Base):
    __tablename__ = "family_memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False) # 'PATRIARCH', 'EDITOR', 'VIEWER'
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'family_id', name='uq_user_family'),
    )

    user = relationship("entity.user_entity.UserEntity", back_populates="memberships")
    family = relationship("entity.family_entity.FamilyEntity")
