from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate
from app.services import transaction as transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionRead, status_code=201)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    return transaction_service.create_transaction(db, data)


@router.get("/", response_model=list[TransactionRead])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    account_id: int | None = None,
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
):
    return transaction_service.get_transactions(
        db, skip, limit, account_id, category_id, start_date, end_date
    )


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    return transaction_service.get_transaction(db, transaction_id)


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction(transaction_id: int, data: TransactionUpdate, db: Session = Depends(get_db)):
    return transaction_service.update_transaction(db, transaction_id, data)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction_service.delete_transaction(db, transaction_id)
