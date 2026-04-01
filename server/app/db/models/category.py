from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.db.models.enums import TransactionType


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(Enum(TransactionType), nullable=False)

    transactions = relationship("Transaction", back_populates="category")
    budget = relationship("Budget", back_populates="category", uselist=False)
