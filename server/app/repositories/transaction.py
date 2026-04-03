from sqlalchemy.orm import Session

from app.db.models.category import Category
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

    def _resolve_category_ids(self, category_id: int, include_subcategories: bool) -> list[int]:
        if not include_subcategories:
            return [category_id]
        child_ids = [
            c.id for c in
            self.db.query(Category.id).filter(Category.parent_id == category_id).all()
        ]
        return [category_id] + child_ids

    def get_all(self, filters: TransactionFilter) -> list[Transaction]:
        conditions = [
            Transaction.account_id == filters.account_id if filters.account_id is not None else None,
            Transaction.date >= filters.start_date if filters.start_date is not None else None,
            Transaction.date <= filters.end_date if filters.end_date is not None else None,
        ]

        if filters.category_id is not None:
            category_ids = self._resolve_category_ids(filters.category_id, filters.include_subcategories)
            if len(category_ids) == 1:
                conditions.append(Transaction.category_id == category_ids[0])
            else:
                conditions.append(Transaction.category_id.in_(category_ids))

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
