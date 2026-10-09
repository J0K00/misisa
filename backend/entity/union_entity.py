from sqlalchemy import Column, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from entity.base import Base

class UnionEntity(Base):
    __tablename__ = "unions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_1_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"))
    partner_2_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True)
    marriage_date = Column(Date, nullable=True)
    divorce_date = Column(Date, nullable=True)

class UnionChildrenEntity(Base):
    __tablename__ = "union_children"
    union_id = Column(UUID(as_uuid=True), ForeignKey("unions.id"), primary_key=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), primary_key=True)
