"""Sync transactions from all linked Plaid accounts.

Usage: uv run python -m scripts.sync_transactions
"""

import logging

from app.clients.plaid import PlaidClient
from app.db.database import SessionLocal
from app.repositories.transaction import TransactionRepository
from app.services.bank import BankService
from app.services.metadata import MetadataService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)


def main():
    db = SessionLocal()
    try:
        plaid_client = PlaidClient()
        transaction_repo = TransactionRepository(db)
        metadata_service = MetadataService(db)
        bank_service = BankService(db, plaid_client, transaction_repo, metadata_service)

        total = bank_service.sync_all()
        print(f"\nDone! Synced {total} transactions.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
