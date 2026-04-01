from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.account import AccountService
from app.services.budget import BudgetService
from app.services.category import CategoryService
from app.services.transaction import TransactionService


def get_account_service(db: Session = Depends(get_db)) -> AccountService:
    return AccountService(db)


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    return CategoryService(db)


def get_transaction_service(
    db: Session = Depends(get_db),
    category_service: CategoryService = Depends(get_category_service),
) -> TransactionService:
    return TransactionService(db, category_service)


def get_budget_service(db: Session = Depends(get_db)) -> BudgetService:
    return BudgetService(db)
