from fastapi import Depends
from sqlalchemy.orm import Session

from app.clients.plaid import PlaidClient
from app.db.database import get_db
from app.repositories.transaction import TransactionRepository
from app.services.account import AccountService
from app.services.bank import BankService
from app.services.budget import BudgetService
from app.services.category import CategoryService
from app.services.metadata import MetadataService
from app.services.transaction import TransactionService


def get_transaction_repository(db: Session = Depends(get_db)) -> TransactionRepository:
    return TransactionRepository(db)


def get_account_service(db: Session = Depends(get_db)) -> AccountService:
    return AccountService(db)


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    return CategoryService(db)


def get_transaction_service(
    repo: TransactionRepository = Depends(get_transaction_repository),
    category_service: CategoryService = Depends(get_category_service),
) -> TransactionService:
    return TransactionService(repo, category_service)


def get_budget_service(db: Session = Depends(get_db)) -> BudgetService:
    return BudgetService(db)


def get_plaid_client() -> PlaidClient:
    return PlaidClient()


def get_metadata_service(db: Session = Depends(get_db)) -> MetadataService:
    return MetadataService(db)


def get_bank_service(
    db: Session = Depends(get_db),
    plaid_client: PlaidClient = Depends(get_plaid_client),
    transaction_repo: TransactionRepository = Depends(get_transaction_repository),
    metadata_service: MetadataService = Depends(get_metadata_service),
) -> BankService:
    return BankService(db, plaid_client, transaction_repo, metadata_service)
