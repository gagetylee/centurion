from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.clients.plaid import PlaidClient
from app.db.models.enums import TransactionType
from app.db.models.plaid_item import PlaidItem
from app.db.models.transaction import Transaction
from app.repositories.transaction import TransactionRepository


class BankService:
    def __init__(self, db: Session, plaid_client: PlaidClient, transaction_repo: TransactionRepository):
        self.db = db
        self.plaid_client = plaid_client
        self.transaction_repo = transaction_repo

    def sync(self, plaid_item_id: int) -> int:
        plaid_item = self.db.query(PlaidItem).filter(PlaidItem.id == plaid_item_id).first()
        if not plaid_item:
            raise HTTPException(status_code=404, detail="Plaid item not found")

        synced = 0
        has_more = True

        while has_more:
            result = self.plaid_client.sync_transactions(plaid_item.access_token, plaid_item.cursor)

            for txn in result["added"]:
                if self.transaction_repo.get_by_plaid_id(txn.transaction_id):
                    continue

                self.transaction_repo.create(Transaction(
                    amount_cents=int(txn.amount * -100),
                    description=txn.name,
                    date=txn.date,
                    type=TransactionType.expense if txn.amount > 0 else TransactionType.income,
                    account_id=plaid_item.account_id,
                    plaid_transaction_id=txn.transaction_id,
                ))
                synced += 1

            for txn in result["modified"]:
                existing = self.transaction_repo.get_by_plaid_id(txn.transaction_id)
                if existing:
                    self.transaction_repo.update(existing, {
                        "amount_cents": int(txn.amount * -100),
                        "description": txn.name,
                        "date": txn.date,
                        "type": TransactionType.expense if txn.amount > 0 else TransactionType.income,
                    })

            for txn in result["removed"]:
                existing = self.transaction_repo.get_by_plaid_id(txn.transaction_id)
                if existing:
                    self.transaction_repo.delete(existing)

            plaid_item.cursor = result["next_cursor"]
            has_more = result["has_more"]

        self.transaction_repo.commit()
        return synced

    def sync_all(self) -> int:
        items = self.db.query(PlaidItem).all()
        total = 0
        for item in items:
            total += self.sync(item.id)
        return total
