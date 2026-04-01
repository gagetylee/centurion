from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionFilter, TransactionUpdate
from app.services.category import CategoryService


class TransactionService:
    def __init__(self, db: Session, category_service: CategoryService):
        self.db = db
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
        txn = self.db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not txn:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return txn

    def get_all(self, filters: TransactionFilter) -> list[Transaction]:
        conditions = [
            Transaction.account_id == filters.account_id if filters.account_id is not None else None,
            Transaction.category_id == filters.category_id if filters.category_id is not None else None,
            Transaction.date >= filters.start_date if filters.start_date is not None else None,
            Transaction.date <= filters.end_date if filters.end_date is not None else None,
        ]
        return (
            self.db.query(Transaction)
            .filter(*[c for c in conditions if c is not None])
            .order_by(Transaction.date.desc())
            .offset(filters.skip)
            .limit(filters.limit)
            .all()
        )

    def create(self, data: TransactionCreate) -> Transaction:
        self._validate_category_type(data.category_id, data.type)
        txn = Transaction(**data.model_dump())
        self.db.add(txn)
        self.db.commit()
        self.db.refresh(txn)
        return txn

    def update(self, transaction_id: int, data: TransactionUpdate) -> Transaction:
        txn = self.get(transaction_id)
        updates = data.model_dump(exclude_unset=True)
        effective_type = updates.get("type", txn.type)
        effective_category_id = updates.get("category_id", txn.category_id)
        self._validate_category_type(effective_category_id, effective_type)
        for key, value in updates.items():
            setattr(txn, key, value)
        self.db.commit()
        self.db.refresh(txn)
        return txn

    def delete(self, transaction_id: int) -> None:
        txn = self.get(transaction_id)
        self.db.delete(txn)
        self.db.commit()
