from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models.budget import Budget
from app.db.models.category import Category
from app.db.models.enums import BudgetPeriod, BudgetType
from app.db.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate


class BudgetService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _get_period_bounds(period: BudgetPeriod, today: date | None = None) -> tuple[date, date]:
        today = today or date.today()
        if period == BudgetPeriod.weekly:
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
        elif period == BudgetPeriod.monthly:
            start = today.replace(day=1)
            if today.month == 12:
                end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        elif period == BudgetPeriod.yearly:
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)
        return start, end

    def get(self, budget_id: int) -> Budget:
        budget = self.db.query(Budget).filter(Budget.id == budget_id).first()
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")
        return budget

    def get_all(self, skip: int = 0, limit: int = 100, budget_type: BudgetType | None = None) -> list[Budget]:
        q = self.db.query(Budget)
        if budget_type is not None:
            q = q.filter(Budget.type == budget_type)
        return q.offset(skip).limit(limit).all()

    def create(self, data: BudgetCreate) -> Budget:
        budget = Budget(**data.model_dump())
        self.db.add(budget)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="A budget already exists for this category")
        self.db.refresh(budget)
        return budget

    def update(self, budget_id: int, data: BudgetUpdate) -> Budget:
        budget = self.get(budget_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(budget, key, value)
        self.db.commit()
        self.db.refresh(budget)
        return budget

    def delete(self, budget_id: int) -> None:
        budget = self.get(budget_id)
        self.db.delete(budget)
        self.db.commit()

    def _get_category_ids_with_children(self, category_id: int) -> list[int]:
        child_ids = [
            c.id for c in
            self.db.query(Category.id).filter(Category.parent_id == category_id).all()
        ]
        return [category_id] + child_ids

    def get_status(self, budget_id: int) -> dict:
        budget = self.get(budget_id)
        period_start, period_end = self._get_period_bounds(budget.period)

        category_ids = self._get_category_ids_with_children(budget.category_id)

        spent_cents = self.db.query(
            func.coalesce(func.sum(Transaction.amount_cents), 0)
        ).filter(
            Transaction.category_id.in_(category_ids),
            Transaction.date >= period_start,
            Transaction.date <= period_end,
        ).scalar()

        return {
            "budget": budget,
            "spent_cents": spent_cents,
            "remaining_cents": budget.amount_cents - spent_cents,
            "period_start": period_start,
            "period_end": period_end,
        }
