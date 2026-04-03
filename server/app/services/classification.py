import logging

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.clients.ollama import OllamaClient
from app.db.models.category import Category
from app.db.models.transaction import Transaction
from app.schemas.classification import EnrichmentResult, ParentClassification, SubcategoryClassification

PARENT_PROMPT = """\
You are a bank transaction categorizer. Given a transaction, return a single JSON object.

Rules:
1. merchant_name: Extract the real merchant name. Strip suffixes like "US", "CA", store numbers, and transaction codes.
2. parent_category: Pick EXACTLY ONE from the list below. Do not invent categories.
3. confidence: "high", "medium", or "low"
4. needs_review: true if confidence is "low" OR category is ambiguous

Categories:
{categories}

Examples:

Transaction: "AMZN MKTP US*AB1CD2EF" | $42.99
{{"merchant_name": "Amazon", "parent_category": "Miscellaneous", "confidence": "medium", "needs_review": false}}

Transaction: "TST* RAIN OR SHINE CAFE" | $6.75
{{"merchant_name": "Rain or Shine Cafe", "parent_category": "Food", "confidence": "high", "needs_review": false}}

Transaction: "UBER *EATS 4F2A1B" | $28.50
{{"merchant_name": "Uber Eats", "parent_category": "Food", "confidence": "high", "needs_review": false}}

Transaction: "PAYROLL DEPOSIT - ACME CO" | $3200.00
{{"merchant_name": "Acme Co", "parent_category": "Income", "confidence": "high", "needs_review": false}}

Transaction: "SP * 8842910 VANCOUVER" | $24.99
{{"merchant_name": "Unknown", "parent_category": "Miscellaneous", "confidence": "low", "needs_review": true}}

Now classify this transaction:
- Description: {description}
- Amount: ${amount:.2f}

Respond with ONLY the JSON object, no markdown fences, no explanation:"""

SUBCATEGORY_PROMPT = """\
Given a transaction already classified under "{parent_category}", pick the most specific sub-category.

Sub-categories:
{subcategories}

Transaction:
- Description: {description}
- Amount: ${amount:.2f}
- Merchant: {merchant_name}

If none of the sub-categories fit well, return null.

Respond with ONLY this JSON, no markdown fences, no explanation:
{{"subcategory": "..."}}"""


class ClassificationService:
    def __init__(self, db: Session, llm: OllamaClient, merchant_service):
        self.db = db
        self.llm = llm
        self.merchant_service = merchant_service
        self._parent_categories: dict[str, int] | None = None
        self._subcategories: dict[int, dict[str, int]] | None = None

    # ── Category cache ──────────────────────────────────────

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

    def ensure_categories_loaded(self) -> None:
        """Pre-load categories into memory. Call before spawning threads."""
        if self._parent_categories is None:
            self._load_categories()

    # ── Classification ──────────────────────────────────────

    def _classify_parent(self, description: str, amount_cents: int) -> ParentClassification:
        prompt = PARENT_PROMPT.format(
            description=description,
            amount=abs(amount_cents) / 100,
            categories="\n".join(f"- {name}" for name in self.parent_categories),
        )
        try:
            data = self.llm.chat_json(prompt)
            result = ParentClassification(**data)
            logger.info(
                "  → merchant: %s | parent: %s | confidence: %s",
                result.merchant_name, result.parent_category, result.confidence,
            )
            return result
        except Exception as e:
            logger.warning("  → parent classification failed: %s", e)
            return ParentClassification(needs_review=True)

    def _classify_subcategory(
        self, description: str, amount_cents: int, merchant_name: str | None, parent_name: str, parent_id: int,
    ) -> SubcategoryClassification:
        children = self.subcategories.get(parent_id, {})
        if not children:
            return SubcategoryClassification()

        prompt = SUBCATEGORY_PROMPT.format(
            description=description,
            amount=abs(amount_cents) / 100,
            merchant_name=merchant_name or "Unknown",
            parent_category=parent_name,
            subcategories="\n".join(f"- {name}" for name in children),
        )
        try:
            data = self.llm.chat_json(prompt)
            result = SubcategoryClassification(**data)
            logger.info("  → subcategory: %s", result.subcategory)
            return result
        except Exception as e:
            logger.warning("  → subcategory classification failed: %s", e)
            return SubcategoryClassification()

    def classify(self, description: str, amount_cents: int) -> EnrichmentResult:
        """Thread-safe classification with merchant cache lookup.
        Does NOT access self.db — caches must be loaded beforehand."""
        cached = self.merchant_service.lookup(description)
        if cached:
            merchant_name, category_id = cached
            logger.info("  → cache hit: %s → category_id %d", merchant_name, category_id)
            return EnrichmentResult(
                merchant_name=merchant_name,
                category_id=category_id,
                needs_review=False,
            )

        # Stage 1: parent category + merchant extraction
        parent_result = self._classify_parent(description, amount_cents)

        enrichment = EnrichmentResult(
            merchant_name=parent_result.merchant_name,
            needs_review=parent_result.needs_review,
        )

        parent_name = parent_result.parent_category
        if not parent_name or parent_name not in self.parent_categories:
            if parent_name:
                logger.warning("  → unknown parent category: %s — flagged for review", parent_name)
            enrichment.needs_review = True
            return enrichment

        parent_id = self.parent_categories[parent_name]

        # Stage 2: subcategory
        sub_result = self._classify_subcategory(
            description, amount_cents, parent_result.merchant_name, parent_name, parent_id,
        )

        children = self.subcategories.get(parent_id, {})
        if sub_result.subcategory and sub_result.subcategory in children:
            enrichment.category_id = children[sub_result.subcategory]
        else:
            enrichment.category_id = parent_id
            if sub_result.subcategory:
                logger.warning("  → unknown subcategory: %s — falling back to parent", sub_result.subcategory)

        return enrichment

    def enrich(self, transaction: Transaction) -> EnrichmentResult:
        """Classifies and applies category + review status to a Transaction.
        Returns the EnrichmentResult so the caller can resolve merchant_id."""
        result = self.classify(transaction.description or "", transaction.amount_cents)
        transaction.category_id = result.category_id
        transaction.needs_review = result.needs_review
        return result
