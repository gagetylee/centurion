import json
import logging

from ollama import Client
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.config import OLLAMA_HOST, OLLAMA_MODEL
from app.db.models.category import Category
from app.db.models.transaction import Transaction
from app.schemas.metadata import TransactionMetadata

PROMPT_TEMPLATE = """\
You are a bank transaction categorizer. Given a transaction, return a single JSON object.

Rules:
1. merchant_name: Extract the real merchant name. Strip suffixes like "US", "CA", store numbers, and transaction codes. Examples:
   - "AMZN MKTP US*AB1CD2EF" → "Amazon"
   - "SPOTIFY P1A2B3C4D" → "Spotify"
   - "TST* RAIN OR SHINE CAFE" → "Rain or Shine Cafe"
   - "SQ *BLUE TOKAI COFFEE" → "Blue Tokai Coffee"
2. category_name: Pick EXACTLY ONE from the list below. Do not invent categories.
3. is_recurring: true only for subscriptions, memberships, insurance, or charges that repeat on a fixed schedule. One-time purchases are false.
4. confidence: "high", "medium", or "low"
5. needs_review: true if confidence is "low" OR category is ambiguous

Categories (pick one):
{categories}

Transaction:
- Description: {description}
- Amount: ${amount:.2f}

Respond with ONLY this JSON structure, no markdown fences, no explanation:
{{"merchant_name": "...", "category_name": "...", "is_recurring": false, "confidence": "high", "needs_review": false}}"""


class MetadataService:
    def __init__(self, db: Session):
        self.db = db
        self.client = Client(host=OLLAMA_HOST)
        self._categories: dict[str, int] | None = None

    @property
    def categories(self) -> dict[str, int]:
        if self._categories is None:
            rows = self.db.query(Category).all()
            self._categories = {c.name: c.id for c in rows}
        return self._categories

    def _extract_metadata(self, description: str, amount_cents: int) -> TransactionMetadata:
        prompt = PROMPT_TEMPLATE.format(
            description=description,
            amount=abs(amount_cents) / 100,
            categories="\n".join(f"- {c}" for c in self.categories.keys()),
        )

        try:
            response = self.client.chat(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": prompt}],
                format="json",
            )
            data = json.loads(response["message"]["content"])
            metadata = TransactionMetadata(**data)
            logger.info("  → merchant: %s | category: %s | recurring: %s | confidence: %s", metadata.merchant_name, metadata.category_name, metadata.is_recurring, metadata.confidence)
            return metadata
        except Exception as e:
            logger.warning("  → enrichment failed: %s", e)
            return TransactionMetadata(needs_review=True)

    def enrich(self, transaction: Transaction) -> Transaction:
        metadata = self._extract_metadata(
            description=transaction.description or "",
            amount_cents=transaction.amount_cents,
        )

        transaction.merchant_name = metadata.merchant_name
        transaction.is_recurring = metadata.is_recurring
        transaction.needs_review = metadata.needs_review

        if metadata.category_name and metadata.category_name in self.categories:
            transaction.category_id = self.categories[metadata.category_name]
        elif metadata.category_name:
            logger.warning("  → unknown category: %s — flagged for review", metadata.category_name)
            transaction.needs_review = True

        return transaction
