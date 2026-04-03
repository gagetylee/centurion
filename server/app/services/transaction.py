from fastapi import HTTPException

from app.db.models.transaction import Transaction
from app.repositories.transaction import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionFilter, TransactionUpdate
from app.services.category import CategoryService


class TransactionService:
    def __init__(self, repo: TransactionRepository, category_service: CategoryService):
        self.repo = repo
        self.category_service = category_service

    def _validate_category_type(self, category_id: int | None, txn_type) -> None:
        if category_id is None:
            return
        category = self.category_service.get(category_id)
        if category.type != txn_type:
            raise HTTPException(
                status_code=422,
                detail=f"Transaction type '{txn_type.value}' does not match category type '{category.type.value}'",
            )

    def get(self, transaction_id: int) -> Transaction:
        txn = self.repo.get_by_id(transaction_id)
        if not txn:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return txn

    def get_all(self, filters: TransactionFilter) -> list[Transaction]:
        return self.repo.get_all(filters)

    def create(self, data: TransactionCreate) -> Transaction:
        self._validate_category_type(data.category_id, data.type)
        txn = Transaction(**data.model_dump())
        self.repo.create(txn)
        self.repo.db.commit()
        return txn

    def update(self, transaction_id: int, data: TransactionUpdate) -> Transaction:
        txn = self.get(transaction_id)
        updates = data.model_dump(exclude_unset=True)
        effective_type = updates.get("type", txn.type)
        effective_category_id = updates.get("category_id", txn.category_id)
        self._validate_category_type(effective_category_id, effective_type)
        self.repo.update(txn, updates)
        self.repo.db.commit()
        return txn

    def delete(self, transaction_id: int) -> None:
        txn = self.get(transaction_id)
        self.repo.delete(txn)
        self.repo.db.commit()
