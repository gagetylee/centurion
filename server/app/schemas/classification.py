from pydantic import BaseModel


class Classification(BaseModel):
    merchant_name: str | None = None
    parent_category: str | None = None
    subcategory: str | None = None
    confidence: str = "high"
    needs_review: bool = False


class EnrichmentResult(BaseModel):
    merchant_name: str | None = None
    category_id: int | None = None
    needs_review: bool = False
