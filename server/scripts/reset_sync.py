"""Reset all synced transactions and Plaid cursors so you can re-sync.

Usage: uv run python -m scripts.reset_sync
"""

from app.db.database import SessionLocal
from app.db.models.plaid_item import PlaidItem
from app.db.models.transaction import Transaction


def main():
    db = SessionLocal()
    try:
        count = db.query(Transaction).filter(Transaction.plaid_transaction_id.isnot(None)).delete()
        db.query(PlaidItem).update({"cursor": None})
        db.commit()
        print(f"Deleted {count} synced transactions and reset all cursors.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
