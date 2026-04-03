import logging

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.clients.ollama import OllamaClient
from app.db.models.category import Category
from app.db.models.transaction import Transaction
from app.schemas.classification import Classification, EnrichmentResult

CLASSIFY_PROMPT = """\
You are a bank transaction categorizer. Given a transaction, return a single JSON object.

Rules:
1. merchant_name: Extract the real merchant name. Strip suffixes like "US", "CA", store numbers, and transaction codes.
2. parent_category: Pick EXACTLY ONE parent from the hierarchy below. Do not invent categories.
3. subcategory: Pick the most specific sub-category under your chosen parent. Use null if none fit well.
4. confidence: "high", "medium", or "low"
5. needs_review: true if confidence is "low" OR category is ambiguous

Categories:
{categories}

Examples:

Transaction: "AMZN MKTP US*AB1CD2EF" | $42.99
{{"merchant_name": "Amazon", "parent_category": "Miscellaneous", "subcategory": "One-Time Purchases", "confidence": "medium", "needs_review": false}}

Transaction: "TST* RAIN OR SHINE CAFE" | $6.75
{{"merchant_name": "Rain or Shine Cafe", "parent_category": "Food", "subcategory": "Coffee Shops", "confidence": "high", "needs_review": false}}

Transaction: "UBER *EATS 4F2A1B" | $28.50
{{"merchant_name": "Uber Eats", "parent_category": "Food", "subcategory": "Takeout & Delivery", "confidence": "high", "needs_review": false}}

Transaction: "PAYROLL DEPOSIT - ACME CO" | $3200.00
{{"merchant_name": "Acme Co", "parent_category": "Income", "subcategory": "Salary", "confidence": "high", "needs_review": false}}

Transaction: "SP * 8842910 VANCOUVER" | $24.99
{{"merchant_name": "Unknown", "parent_category": "Miscellaneous", "subcategory": null, "confidence": "low", "needs_review": true}}

Now classify this transaction:
- Description: {description}
- Amount: ${amount:.2f}

Respond with ONLY the JSON object, no markdown fences, no explanation:"""


class ClassificationService:
    def __init__(self, db: Session, llm: OllamaClient):
        self.db = db
        self.llm = llm
        self._parent_categories: dict[str, int] | None = None
        self._subcategories: dict[int, dict[str, int]] | None = None

    def _load_categories(self) -> None:
        rows = self.db.query(Category).all()
        self._parent_categories = {}
        self._subcategories = {}
        for cat in rows:
            if cat.parent_id is None:
                self._parent_categories[cat.name] = cat.id
                self._subcategories[cat.id] = {}
        for cat in rows:
            if cat.parent_id is not None and cat.parent_id in self._subcategories:
                self._subcategories[cat.parent_id][cat.name] = cat.id

    @property
    def parent_categories(self) -> dict[str, int]:
        if self._parent_categories is None:
            self._load_categories()
        return self._parent_categories

    @property
    def subcategories(self) -> dict[int, dict[str, int]]:
        if self._subcategories is None:
            self._load_categories()
        return self._subcategories

    def _format_category_hierarchy(self) -> str:
        lines = []
        for name, parent_id in self.parent_categories.items():
            children = self.subcategories.get(parent_id, {})
            lines.append(f"[{name}]")
            if children:
                for child in children:
                    lines.append(f"  - {child}")
        return "\n".join(lines)

    def _classify(self, description: str, amount_cents: int) -> Classification:
        prompt = CLASSIFY_PROMPT.format(
            description=description,
            amount=abs(amount_cents) / 100,
            categories=self._format_category_hierarchy(),
        )
        try:
            data = self.llm.chat_json(prompt)
            result = Classification(**data)
            logger.info(
                "  → merchant: %s | category: %s > %s | confidence: %s",
                result.merchant_name, result.parent_category, result.subcategory, result.confidence,
            )
            return result
        except Exception as e:
            logger.warning("  → classification failed: %s", e)
            return Classification(needs_review=True)

    def ensure_categories_loaded(self) -> None:
        """Pre-load categories into memory. Call before spawning threads."""
        if self._parent_categories is None:
            self._load_categories()

    def classify(self, description: str, amount_cents: int) -> EnrichmentResult:
        """Thread-safe classification. Only reads cached categories and calls the LLM.
        Does NOT access self.db — categories must be loaded beforehand."""
        result = self._classify(description, amount_cents)

        enrichment = EnrichmentResult(
            merchant_name=result.merchant_name,
            needs_review=result.needs_review,
        )

        parent_name = result.parent_category
        if not parent_name or parent_name not in self.parent_categories:
            if parent_name:
                logger.warning("  → unknown parent category: %s — flagged for review", parent_name)
            enrichment.needs_review = True
            return enrichment

        parent_id = self.parent_categories[parent_name]
        children = self.subcategories.get(parent_id, {})

        if result.subcategory and result.subcategory in children:
            enrichment.category_id = children[result.subcategory]
        else:
            enrichment.category_id = parent_id
            if result.subcategory:
                logger.warning("  → unknown subcategory: %s — falling back to parent", result.subcategory)

        return enrichment

    def enrich(self, transaction: Transaction) -> Transaction:
        """Convenience wrapper: classifies and applies results to a Transaction."""
        result = self.classify(transaction.description or "", transaction.amount_cents)
        transaction.merchant_name = result.merchant_name
        transaction.category_id = result.category_id
        transaction.needs_review = result.needs_review
        return transaction
