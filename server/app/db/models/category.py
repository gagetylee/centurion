from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, String, Enum, text
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.db.models.enums import TransactionType


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        Index(
            "uq_categories_name_top_level",
            "name",
            unique=True,
            postgresql_where=text("parent_id IS NULL"),
        ),
        Index(
            "uq_categories_name_parent",
            "name",
            "parent_id",
            unique=True,
            postgresql_where=text("parent_id IS NOT NULL"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_default = Column(Boolean, nullable=False, default=False, server_default="false")

    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="category")
    budget = relationship("Budget", back_populates="category", uselist=False)
