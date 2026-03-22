from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.account import AccountCreate, AccountRead, AccountUpdate
from app.services import account as account_service

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post("/", response_model=AccountRead, status_code=201)
def create_account(data: AccountCreate, db: Session = Depends(get_db)):
    return account_service.create_account(db, data)


@router.get("/", response_model=list[AccountRead])
def list_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return account_service.get_accounts(db, skip, limit)


@router.get("/{account_id}", response_model=AccountRead)
def get_account(account_id: int, db: Session = Depends(get_db)):
    return account_service.get_account(db, account_id)


@router.patch("/{account_id}", response_model=AccountRead)
def update_account(account_id: int, data: AccountUpdate, db: Session = Depends(get_db)):
    return account_service.update_account(db, account_id, data)


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account_service.delete_account(db, account_id)
