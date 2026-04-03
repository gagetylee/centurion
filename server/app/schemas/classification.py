from pydantic import BaseModel


class ParentClassification(BaseModel):
    merchant_name: str | None = None
    parent_category: str | None = None
    is_recurring: bool = False
    confidence: str = "high"
    needs_review: bool = False


class SubcategoryClassification(BaseModel):
    subcategory: str | None = None
