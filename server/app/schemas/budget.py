from datetime import date

from pydantic import BaseModel, ConfigDict

from app.db.models.enums import BudgetPeriod, BudgetType
from app.schemas.category import CategoryRead


class BudgetCreate(BaseModel):
    category_id: int
    amount_cents: int
    period: BudgetPeriod = BudgetPeriod.monthly
    type: BudgetType


class BudgetUpdate(BaseModel):
    amount_cents: int | None = None
    period: BudgetPeriod | None = None
    type: BudgetType | None = None


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    amount_cents: int
    period: BudgetPeriod
    type: BudgetType
    category: CategoryRead


class BudgetStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    budget: BudgetRead
    spent_cents: int
    remaining_cents: int
    period_start: date
    period_end: date
