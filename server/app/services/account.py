from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate


def get_account(db: Session, account_id: int) -> Account:
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


def get_accounts(db: Session, skip: int = 0, limit: int = 100) -> list[Account]:
    return db.query(Account).offset(skip).limit(limit).all()


def create_account(db: Session, data: AccountCreate) -> Account:
    account = Account(**data.model_dump())
    db.add(account)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Account with this name already exists")
    db.refresh(account)
    return account


def update_account(db: Session, account_id: int, data: AccountUpdate) -> Account:
    account = get_account(db, account_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Account with this name already exists")
    db.refresh(account)
    return account


def delete_account(db: Session, account_id: int) -> None:
    account = get_account(db, account_id)
    db.delete(account)
    db.commit()
