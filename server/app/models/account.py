from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.enums import AccountType


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(Enum(AccountType), nullable=False)

    transactions = relationship("Transaction", back_populates="account")
