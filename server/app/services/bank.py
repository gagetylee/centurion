import logging
from concurrent.futures import ThreadPoolExecutor

from fastapi import HTTPException

logger = logging.getLogger(__name__)

from app.clients.plaid import PlaidClient
from app.config import ENRICHMENT_WORKERS
from app.db.models.enums import TransactionType
from app.schemas.classification import EnrichmentResult
from app.db.models.plaid_item import PlaidItem
from app.db.models.transaction import Transaction
from app.db.unit_of_work import UnitOfWork
from app.repositories.transaction import TransactionRepository
from app.services.classification import ClassificationService
from app.services.merchant import MerchantService, normalize_description


class BankService:
    def __init__(self, uow: UnitOfWork, plaid_client: PlaidClient, transaction_repo: TransactionRepository, classification_service: ClassificationService, merchant_service: MerchantService):
        self.uow = uow
        self.plaid_client = plaid_client
        self.transaction_repo = transaction_repo
        self.classification_service = classification_service
        self.merchant_service = merchant_service

    def sync(self, plaid_item_id: int) -> int:
        plaid_item = self.uow.session.query(PlaidItem).filter(PlaidItem.id == plaid_item_id).first()
        if not plaid_item:
            raise HTTPException(status_code=404, detail="Plaid item not found")

        logger.info("Syncing plaid item %d (account: %s)", plaid_item.id, plaid_item.account.name)
        self.classification_service.ensure_categories_loaded()
        self.merchant_service.load_cache()
        synced = 0
        has_more = True

        while has_more:
            result = self.plaid_client.sync_transactions(plaid_item.access_token, plaid_item.cursor)
            logger.info("Fetched %d added, %d modified, %d removed", len(result["added"]), len(result["modified"]), len(result["removed"]))

            # Phase 1: Build — create Transaction objects in memory, skip duplicates
            new_transactions = []
            for txn in result["added"]:
                if self.transaction_repo.get_by_plaid_id(txn.transaction_id):
                    logger.debug("Skipping duplicate: %s", txn.transaction_id)
                    continue

                transaction = Transaction(
                    amount_cents=int(abs(txn.amount) * 100),
                    description=txn.name,
                    date=txn.date,
                    type=TransactionType.expense if txn.amount > 0 else TransactionType.income,
                    account_id=plaid_item.account_id,
                    plaid_transaction_id=txn.transaction_id,
                )
                logger.info("+ %s | $%.2f | %s", txn.date, abs(txn.amount), txn.name)
                new_transactions.append(transaction)

            # Phase 2: Enrich — deduplicate by description, then parallel classify
            groups: dict[str, list[int]] = {}
            unique_txns: list[Transaction] = []
            for i, t in enumerate(new_transactions):
                key = normalize_description(t.description or "")
                if key not in groups:
                    groups[key] = []
                    unique_txns.append(t)
                groups[key].append(i)

            with ThreadPoolExecutor(max_workers=ENRICHMENT_WORKERS) as pool:
                unique_enrichments = list(pool.map(self.classification_service.enrich, unique_txns))

            # Fan out results to all transactions sharing the same description
            enrichments: list[EnrichmentResult] = [None] * len(new_transactions)
            for enrichment, t in zip(unique_enrichments, unique_txns):
                key = normalize_description(t.description or "")
                for idx in groups[key]:
                    enrichments[idx] = enrichment
                    new_transactions[idx].category_id = enrichment.category_id
                    new_transactions[idx].needs_review = enrichment.needs_review

            # Phase 3: Persist — resolve merchants, then transactions, single commit
            self.merchant_service.resolve_merchants(new_transactions, enrichments)
            for t in new_transactions:
                self.transaction_repo.create(t)
            synced += len(new_transactions)

            for txn in result["modified"]:
                existing = self.transaction_repo.get_by_plaid_id(txn.transaction_id)
                if existing:
                    logger.info("~ Modified: %s | %s", txn.date, txn.name)
                    self.transaction_repo.update(existing, {
                        "amount_cents": int(abs(txn.amount) * 100),
                        "description": txn.name,
                        "date": txn.date,
                        "type": TransactionType.expense if txn.amount > 0 else TransactionType.income,
                    })

            for txn in result["removed"]:
                existing = self.transaction_repo.get_by_plaid_id(txn.transaction_id)
                if existing:
                    logger.info("- Removed: %s", txn.transaction_id)
                    self.transaction_repo.delete(existing)

            plaid_item.cursor = result["next_cursor"]
            has_more = result["has_more"]
            self.uow.commit()
        logger.info("Sync complete: %d new transactions", synced)
        return synced

    def sync_all(self) -> int:
        items = self.uow.session.query(PlaidItem).all()
        logger.info("Syncing %d linked accounts", len(items))
        total = 0
        for item in items:
            total += self.sync(item.id)
        logger.info("All syncs complete: %d total transactions", total)
        return total
