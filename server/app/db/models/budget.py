from sqlalchemy import Column, Integer, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.db.models.enums import BudgetPeriod, BudgetType


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, unique=True)
    amount_cents = Column(Integer, nullable=False)
    period = Column(Enum(BudgetPeriod), nullable=False, default=BudgetPeriod.monthly)
    type = Column(Enum(BudgetType), nullable=False)

    category = relationship("Category", back_populates="budget")
