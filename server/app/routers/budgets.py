from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetStatus, BudgetUpdate
from app.services import budget as budget_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetRead, status_code=201)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db)):
    return budget_service.create_budget(db, data)


@router.get("/", response_model=list[BudgetRead])
def list_budgets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return budget_service.get_budgets(db, skip, limit)


@router.get("/{budget_id}", response_model=BudgetRead)
def get_budget(budget_id: int, db: Session = Depends(get_db)):
    return budget_service.get_budget(db, budget_id)


@router.get("/{budget_id}/status", response_model=BudgetStatus)
def get_budget_status(budget_id: int, db: Session = Depends(get_db)):
    return budget_service.get_budget_status(db, budget_id)


@router.patch("/{budget_id}", response_model=BudgetRead)
def update_budget(budget_id: int, data: BudgetUpdate, db: Session = Depends(get_db)):
    return budget_service.update_budget(db, budget_id, data)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget_service.delete_budget(db, budget_id)
