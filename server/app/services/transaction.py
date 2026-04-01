from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models.category import Category
from app.db.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def _validate_category_type(db: Session, category_id: int | None, txn_type) -> None:
    if category_id is None:
        return
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.type != txn_type:
        raise HTTPException(
            status_code=422,
            detail=f"Transaction type '{txn_type.value}' does not match category type '{category.type.value}'",
        )


def get_transaction(db: Session, transaction_id: int) -> Transaction:
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    account_id: int | None = None,
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[Transaction]:
    q = db.query(Transaction)
    if account_id is not None:
        q = q.filter(Transaction.account_id == account_id)
    if category_id is not None:
        q = q.filter(Transaction.category_id == category_id)
    if start_date is not None:
        q = q.filter(Transaction.date >= start_date)
    if end_date is not None:
        q = q.filter(Transaction.date <= end_date)
    return q.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()


def create_transaction(db: Session, data: TransactionCreate) -> Transaction:
    _validate_category_type(db, data.category_id, data.type)
    txn = Transaction(**data.model_dump())
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


def update_transaction(db: Session, transaction_id: int, data: TransactionUpdate) -> Transaction:
    txn = get_transaction(db, transaction_id)
    updates = data.model_dump(exclude_unset=True)
    effective_type = updates.get("type", txn.type)
    effective_category_id = updates.get("category_id", txn.category_id)
    _validate_category_type(db, effective_category_id, effective_type)
    for key, value in updates.items():
        setattr(txn, key, value)
    db.commit()
    db.refresh(txn)
    return txn


def delete_transaction(db: Session, transaction_id: int) -> None:
    txn = get_transaction(db, transaction_id)
    db.delete(txn)
    db.commit()
