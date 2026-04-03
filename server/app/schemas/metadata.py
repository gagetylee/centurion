from pydantic import BaseModel


class TransactionMetadata(BaseModel):
    merchant_name: str | None = None
    category_name: str | None = None
    is_recurring: bool = False
    confidence: str = "high"
    needs_review: bool = False
