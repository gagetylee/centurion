from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from app.db.models.enums import TransactionType


class CategoryCreate(BaseModel):
    name: str
    type: TransactionType | None = None
    parent_id: int | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    type: TransactionType | None = None


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: TransactionType
    parent_id: int | None = None
    is_default: bool = False


class CategoryTreeRead(CategoryRead):
    children: list[CategoryTreeRead] = []
