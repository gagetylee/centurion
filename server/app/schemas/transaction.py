import datetime

from pydantic import BaseModel, ConfigDict

from app.db.models.enums import TransactionType
from app.schemas.category import CategoryRead
from app.schemas.account import AccountRead


class TransactionCreate(BaseModel):
    amount_cents: int
    description: str | None = None
    date: datetime.date
    type: TransactionType
    account_id: int | None = None
    category_id: int | None = None


class TransactionUpdate(BaseModel):
    amount_cents: int | None = None
    description: str | None = None
    date: datetime.date | None = None
    type: TransactionType | None = None
    account_id: int | None = None
    category_id: int | None = None


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount_cents: int
    description: str | None = None
    date: datetime.date
    type: TransactionType
    account_id: int | None = None
    category_id: int | None = None
    account: AccountRead | None = None
    category: CategoryRead | None = None
