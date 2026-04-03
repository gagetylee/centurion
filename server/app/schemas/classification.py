from pydantic import BaseModel


class ParentClassification(BaseModel):
    merchant_name: str | None = None
    parent_category: str | None = None
    confidence: str = "high"
    needs_review: bool = False


class SubcategoryClassification(BaseModel):
    subcategory: str | None = None


class EnrichmentResult(BaseModel):
    merchant_name: str | None = None
    category_id: int | None = None
    needs_review: bool = False
