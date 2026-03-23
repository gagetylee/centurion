from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.enums import BudgetPeriod, BudgetType
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate


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


def get_budget(db: Session, budget_id: int) -> Budget:
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget


def get_budgets(db: Session, skip: int = 0, limit: int = 100, budget_type: BudgetType | None = None) -> list[Budget]:
    q = db.query(Budget)
    if budget_type is not None:
        q = q.filter(Budget.type == budget_type)
    return q.offset(skip).limit(limit).all()


def create_budget(db: Session, data: BudgetCreate) -> Budget:
    budget = Budget(**data.model_dump())
    db.add(budget)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A budget already exists for this category")
    db.refresh(budget)
    return budget


def update_budget(db: Session, budget_id: int, data: BudgetUpdate) -> Budget:
    budget = get_budget(db, budget_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(budget, key, value)
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget_id: int) -> None:
    budget = get_budget(db, budget_id)
    db.delete(budget)
    db.commit()


def get_budget_status(db: Session, budget_id: int) -> dict:
    budget = get_budget(db, budget_id)
    period_start, period_end = _get_period_bounds(budget.period)

    spent_cents = db.query(
        func.coalesce(func.sum(Transaction.amount_cents), 0)
    ).filter(
        Transaction.category_id == budget.category_id,
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
