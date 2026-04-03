import logging

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.clients.ollama import OllamaClient
from app.db.models.category import Category
from app.db.models.transaction import Transaction
from app.schemas.classification import ParentClassification, SubcategoryClassification

PARENT_PROMPT = """\
You are a bank transaction categorizer. Given a transaction, return a single JSON object.

Rules:
1. merchant_name: Extract the real merchant name. Strip suffixes like "US", "CA", store numbers, and transaction codes. Examples:
   - "AMZN MKTP US*AB1CD2EF" → "Amazon"
   - "SPOTIFY P1A2B3C4D" → "Spotify"
   - "TST* RAIN OR SHINE CAFE" → "Rain or Shine Cafe"
   - "SQ *BLUE TOKAI COFFEE" → "Blue Tokai Coffee"
2. parent_category: Pick EXACTLY ONE from the list below. Do not invent categories.
3. is_recurring: true only for subscriptions, memberships, insurance, or charges that repeat on a fixed schedule. One-time purchases are false.
4. confidence: "high", "medium", or "low"
5. needs_review: true if confidence is "low" OR category is ambiguous

Categories (pick one):
{categories}

Transaction:
- Description: {description}
- Amount: ${amount:.2f}

Respond with ONLY this JSON structure, no markdown fences, no explanation:
{{"merchant_name": "...", "parent_category": "...", "is_recurring": false, "confidence": "high", "needs_review": false}}"""

SUBCATEGORY_PROMPT = """\
Given a transaction already classified under "{parent_category}", pick the most specific sub-category.

Sub-categories (pick one):
{subcategories}

Transaction:
- Description: {description}
- Amount: ${amount:.2f}
- Merchant: {merchant_name}

If none of the sub-categories fit well, return null.

Respond with ONLY this JSON structure, no markdown fences, no explanation:
{{"subcategory": "..."}}"""


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
                "  → merchant: %s | parent: %s | recurring: %s | confidence: %s",
                result.merchant_name, result.parent_category, result.is_recurring, result.confidence,
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

    def enrich(self, transaction: Transaction) -> Transaction:
        description = transaction.description or ""
        amount_cents = transaction.amount_cents

        # Stage 1: classify parent category
        parent_result = self._classify_parent(description, amount_cents)
        transaction.merchant_name = parent_result.merchant_name
        transaction.is_recurring = parent_result.is_recurring
        transaction.needs_review = parent_result.needs_review

        parent_name = parent_result.parent_category
        if not parent_name or parent_name not in self.parent_categories:
            if parent_name:
                logger.warning("  → unknown parent category: %s — flagged for review", parent_name)
            transaction.needs_review = True
            return transaction

        parent_id = self.parent_categories[parent_name]

        # Stage 2: classify sub-category
        sub_result = self._classify_subcategory(
            description, amount_cents, parent_result.merchant_name, parent_name, parent_id,
        )

        children = self.subcategories.get(parent_id, {})
        if sub_result.subcategory and sub_result.subcategory in children:
            transaction.category_id = children[sub_result.subcategory]
        else:
            # Fall back to parent category
            transaction.category_id = parent_id
            if sub_result.subcategory:
                logger.warning("  → unknown subcategory: %s — falling back to parent", sub_result.subcategory)

        return transaction
