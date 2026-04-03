from sqlalchemy.orm import Session

from app.db.models.merchant import Merchant, MerchantPattern


class MerchantRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_name(self, name: str) -> Merchant | None:
        return self.db.query(Merchant).filter(Merchant.name == name).first()

    def get_pattern(self, normalized_description: str) -> MerchantPattern | None:
        return self.db.query(MerchantPattern).filter(
            MerchantPattern.normalized_description == normalized_description
        ).first()

    def get_all_with_patterns(self) -> list[tuple[MerchantPattern, Merchant]]:
        return self.db.query(MerchantPattern, Merchant).join(Merchant).all()

    def create(self, name: str, category_id: int, source: str = "llm") -> Merchant:
        merchant = Merchant(name=name, category_id=category_id, source=source)
        self.db.add(merchant)
        self.db.flush()
        return merchant

    def create_pattern(self, merchant_id: int, normalized_description: str) -> MerchantPattern:
        pattern = MerchantPattern(merchant_id=merchant_id, normalized_description=normalized_description)
        self.db.add(pattern)
        self.db.flush()
        return pattern
