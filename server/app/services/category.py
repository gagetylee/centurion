from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.db.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, category_id: int) -> Category:
        category = self.db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    def get_all(self, skip: int = 0, limit: int = 100, parent_id: int | None = None) -> list[Category]:
        q = self.db.query(Category)
        if parent_id is not None:
            q = q.filter(Category.parent_id == parent_id)
        return q.offset(skip).limit(limit).all()

    def get_tree(self) -> list[Category]:
        return (
            self.db.query(Category)
            .filter(Category.parent_id.is_(None))
            .options(joinedload(Category.children))
            .all()
        )

    def create(self, data: CategoryCreate) -> Category:
        fields = data.model_dump(exclude_unset=True)

        if data.parent_id is not None:
            parent = self.get(data.parent_id)
            if parent.parent_id is not None:
                raise HTTPException(status_code=422, detail="Cannot create a sub-category of a sub-category")
            fields["type"] = parent.type
        elif data.type is None:
            raise HTTPException(status_code=422, detail="Type is required for top-level categories")

        category = Category(**fields)
        self.db.add(category)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Category with this name already exists at this level")
        self.db.refresh(category)
        return category

    def update(self, category_id: int, data: CategoryUpdate) -> Category:
        category = self.get(category_id)
        updates = data.model_dump(exclude_unset=True)

        if "type" in updates and category.parent_id is not None:
            raise HTTPException(status_code=422, detail="Cannot change type of a sub-category")

        for key, value in updates.items():
            setattr(category, key, value)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Category with this name already exists at this level")
        self.db.refresh(category)
        return category

    def delete(self, category_id: int) -> None:
        category = self.get(category_id)
        if category.is_default:
            raise HTTPException(status_code=400, detail="Cannot delete a default category")
        self.db.delete(category)
        self.db.commit()
