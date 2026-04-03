"""Sync transactions from all linked Plaid accounts.

Usage: uv run python -m scripts.sync_transactions
"""

import logging

from app.clients.plaid import PlaidClient
from app.db.unit_of_work import UnitOfWork
from app.repositories.transaction import TransactionRepository
from app.services.bank import BankService
from app.clients.ollama import OllamaClient
from app.services.classification import ClassificationService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)


def main():
    with UnitOfWork() as uow:
        plaid_client = PlaidClient()
        ollama_client = OllamaClient()
        transaction_repo = TransactionRepository(uow.session)
        classification_service = ClassificationService(uow.session, ollama_client)
        bank_service = BankService(uow, plaid_client, transaction_repo, classification_service)

        total = bank_service.sync_all()
        logger.info("Done! Synced %d transactions.", total)


if __name__ == "__main__":
    main()
