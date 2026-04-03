from sqlalchemy import Boolean, Column, Index, Integer, String, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.db.models.enums import TransactionType


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount_cents = Column(Integer, nullable=False)
    description = Column(String)
    date = Column(Date, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    merchant_id = Column(Integer, ForeignKey("merchants.id"))
    plaid_transaction_id = Column(String, unique=True)
    is_recurring = Column(Boolean, default=False)
    needs_review = Column(Boolean, default=False)

    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    merchant = relationship("Merchant")

    __table_args__ = (
        Index("ix_transactions_date", date.desc()),
        Index("ix_transactions_account_date", "account_id", date.desc()),
        Index("ix_transactions_category_date", "category_id", date.desc()),
    )
