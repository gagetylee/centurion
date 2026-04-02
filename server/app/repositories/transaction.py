from sqlalchemy.orm import Session

from app.db.models.transaction import Transaction
from app.schemas.transaction import TransactionFilter


class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, transaction_id: int) -> Transaction | None:
        return self.db.query(Transaction).filter(Transaction.id == transaction_id).first()

    def get_by_plaid_id(self, plaid_transaction_id: str) -> Transaction | None:
        return self.db.query(Transaction).filter(
            Transaction.plaid_transaction_id == plaid_transaction_id
        ).first()

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

    def create(self, txn: Transaction) -> Transaction:
        self.db.add(txn)
        self.db.flush()
        self.db.refresh(txn)
        return txn

    def update(self, txn: Transaction, fields: dict) -> Transaction:
        for key, value in fields.items():
            setattr(txn, key, value)
        self.db.flush()
        self.db.refresh(txn)
        return txn

    def delete(self, txn: Transaction) -> None:
        self.db.delete(txn)

    def commit(self) -> None:
        self.db.commit()
