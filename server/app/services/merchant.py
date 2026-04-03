import logging
import re

from app.db.models.transaction import Transaction
from app.repositories.merchant import MerchantRepository
from app.schemas.classification import EnrichmentResult

logger = logging.getLogger(__name__)


def normalize_description(raw: str) -> str:
    """Normalize a raw Plaid description for merchant pattern matching."""
    text = raw.upper()
    text = re.sub(r'^(TST|SQ|SP)\s*\*\s*', '', text)
    text = re.sub(r'[*#]\s*[A-Z0-9]{4,}$', '', text)
    text = re.sub(r'\s+\d{3,}$', '', text)
    text = re.sub(r'\s+(US|CA|UK|AU)$', '', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text


class MerchantService:
    def __init__(self, repo: MerchantRepository):
        self.repo = repo
        self._cache: dict[str, tuple[str, int, int]] | None = None

    def load_cache(self) -> None:
        """Pre-load merchant patterns into memory. Call before spawning threads."""
        rows = self.repo.get_all_with_patterns()
        self._cache = {}
        for pattern, merchant in rows:
            self._cache[pattern.normalized_description] = (merchant.name, merchant.category_id, merchant.id)
        logger.info("Loaded %d merchant patterns", len(self._cache))

    def lookup(self, description: str) -> tuple[str, int] | None:
        """Thread-safe lookup. Returns (merchant_name, category_id) or None."""
        normalized = normalize_description(description)
        cached = self._cache.get(normalized)
        if cached:
            return (cached[0], cached[1])
        return None

    def resolve_merchants(self, transactions: list[Transaction], enrichments: list[EnrichmentResult]) -> None:
        """Create new merchants and set merchant_id on transactions."""
        for txn, enrichment in zip(transactions, enrichments):
            if not enrichment.merchant_name or not enrichment.category_id:
                continue

            normalized = normalize_description(txn.description or "")
            if not normalized:
                continue

            # Cache hit — use cached merchant_id directly
            cached = self._cache.get(normalized)
            if cached:
                txn.merchant_id = cached[2]
                continue

            # Cache miss — find or create merchant
            merchant = self.repo.get_by_name(enrichment.merchant_name)
            if not merchant:
                merchant = self.repo.create(enrichment.merchant_name, enrichment.category_id)
                logger.info("  → new merchant: %s → category_id %d", merchant.name, merchant.category_id)

            if not self.repo.get_pattern(normalized):
                self.repo.create_pattern(merchant.id, normalized)

            self._cache[normalized] = (merchant.name, merchant.category_id, merchant.id)
            txn.merchant_id = merchant.id
