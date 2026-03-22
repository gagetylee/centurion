from datetime import date

from pydantic import BaseModel, ConfigDict

from app.models.enums import BudgetPeriod
from app.schemas.category import CategoryRead


class BudgetCreate(BaseModel):
    category_id: int
    amount_cents: int
    period: BudgetPeriod = BudgetPeriod.monthly


class BudgetUpdate(BaseModel):
    amount_cents: int | None = None
    period: BudgetPeriod | None = None


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    amount_cents: int
    period: BudgetPeriod
    category: CategoryRead


class BudgetStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    budget: BudgetRead
    spent_cents: int
    remaining_cents: int
    period_start: date
    period_end: date
