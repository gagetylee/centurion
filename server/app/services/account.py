from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate


class AccountService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, account_id: int) -> Account:
        account = self.db.query(Account).filter(Account.id == account_id).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Account]:
        return self.db.query(Account).offset(skip).limit(limit).all()

    def create(self, data: AccountCreate) -> Account:
        account = Account(**data.model_dump())
        self.db.add(account)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Account with this name already exists")
        self.db.refresh(account)
        return account

    def update(self, account_id: int, data: AccountUpdate) -> Account:
        account = self.get(account_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(account, key, value)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Account with this name already exists")
        self.db.refresh(account)
        return account

    def delete(self, account_id: int) -> None:
        account = self.get(account_id)
        self.db.delete(account)
        self.db.commit()
