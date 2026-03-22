from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.enums import TransactionType


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount_cents = Column(Integer, nullable=False)
    description = Column(String)
    date = Column(Date, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
