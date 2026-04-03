from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    source = Column(String, nullable=False, default="llm")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category")
    patterns = relationship("MerchantPattern", back_populates="merchant", cascade="all, delete-orphan")


class MerchantPattern(Base):
    __tablename__ = "merchant_patterns"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    normalized_description = Column(String, unique=True, nullable=False)

    merchant = relationship("Merchant", back_populates="patterns")
