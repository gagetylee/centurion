import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.clients.plaid import PlaidClient
from app.db.models.enums import TransactionType
from app.db.models.plaid_item import PlaidItem
from app.db.models.transaction import Transaction
from app.repositories.transaction import TransactionRepository
from app.services.classification import ClassificationService


class BankService:
    def __init__(self, db: Session, plaid_client: PlaidClient, transaction_repo: TransactionRepository, classification_service: ClassificationService):
        self.db = db
        self.plaid_client = plaid_client
        self.transaction_repo = transaction_repo
        self.classification_service = classification_service

    def sync(self, plaid_item_id: int) -> int:
        plaid_item = self.db.query(PlaidItem).filter(PlaidItem.id == plaid_item_id).first()
        if not plaid_item:
            raise HTTPException(status_code=404, detail="Plaid item not found")

        logger.info("Syncing plaid item %d (account: %s)", plaid_item.id, plaid_item.account.name)
        synced = 0
        has_more = True

        while has_more:
            result = self.plaid_client.sync_transactions(plaid_item.access_token, plaid_item.cursor)
            logger.info("Fetched %d added, %d modified, %d removed", len(result["added"]), len(result["modified"]), len(result["removed"]))

            for txn in result["added"]:
                if self.transaction_repo.get_by_plaid_id(txn.transaction_id):
                    logger.debug("Skipping duplicate: %s", txn.transaction_id)
                    continue

                transaction = Transaction(
                    amount_cents=int(txn.amount * -100),
                    description=txn.name,
                    date=txn.date,
                    type=TransactionType.expense if txn.amount > 0 else TransactionType.income,
                    account_id=plaid_item.account_id,
                    plaid_transaction_id=txn.transaction_id,
                )
                logger.info("+ %s | $%.2f | %s", txn.date, abs(txn.amount), txn.name)
                self.classification_service.enrich(transaction)
                self.transaction_repo.create(transaction)
                self.transaction_repo.commit()
                synced += 1

            for txn in result["modified"]:
                existing = self.transaction_repo.get_by_plaid_id(txn.transaction_id)
                if existing:
                    logger.info("~ Modified: %s | %s", txn.date, txn.name)
                    self.transaction_repo.update(existing, {
                        "amount_cents": int(txn.amount * -100),
                        "description": txn.name,
                        "date": txn.date,
                        "type": TransactionType.expense if txn.amount > 0 else TransactionType.income,
                    })

            for txn in result["removed"]:
                existing = self.transaction_repo.get_by_plaid_id(txn.transaction_id)
                if existing:
                    logger.info("- Removed: %s", txn.transaction_id)
                    self.transaction_repo.delete(existing)

            # Commit cursor + modifications/removals after full page
            plaid_item.cursor = result["next_cursor"]
            has_more = result["has_more"]
            self.transaction_repo.commit()
        logger.info("Sync complete: %d new transactions", synced)
        return synced

    def sync_all(self) -> int:
        items = self.db.query(PlaidItem).all()
        logger.info("Syncing %d linked accounts", len(items))
        total = 0
        for item in items:
            total += self.sync(item.id)
        logger.info("All syncs complete: %d total transactions", total)
        return total
