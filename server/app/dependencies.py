from fastapi import Depends
from sqlalchemy.orm import Session

from app.clients.plaid import PlaidClient
from app.db.database import get_db
from app.db.unit_of_work import UnitOfWork
from app.repositories.merchant import MerchantRepository
from app.repositories.transaction import TransactionRepository
from app.services.account import AccountService
from app.services.bank import BankService
from app.services.budget import BudgetService
from app.services.category import CategoryService
from app.clients.ollama import OllamaClient
from app.services.classification import ClassificationService
from app.services.merchant import MerchantService
from app.services.transaction import TransactionService


def get_uow():
    uow = UnitOfWork()
    with uow:
        yield uow


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


def get_ollama_client() -> OllamaClient:
    return OllamaClient()


def get_bank_service(
    uow: UnitOfWork = Depends(get_uow),
    plaid_client: PlaidClient = Depends(get_plaid_client),
    llm: OllamaClient = Depends(get_ollama_client),
) -> BankService:
    transaction_repo = TransactionRepository(uow.session)
    merchant_repo = MerchantRepository(uow.session)
    merchant_service = MerchantService(merchant_repo)
    classification_service = ClassificationService(uow.session, llm, merchant_service)
    return BankService(uow, plaid_client, transaction_repo, classification_service, merchant_service)
