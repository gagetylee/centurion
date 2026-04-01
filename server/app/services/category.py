from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

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

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Category]:
        return self.db.query(Category).offset(skip).limit(limit).all()

    def create(self, data: CategoryCreate) -> Category:
        category = Category(**data.model_dump())
        self.db.add(category)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Category with this name already exists")
        self.db.refresh(category)
        return category

    def update(self, category_id: int, data: CategoryUpdate) -> Category:
        category = self.get(category_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(category, key, value)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Category with this name already exists")
        self.db.refresh(category)
        return category

    def delete(self, category_id: int) -> None:
        category = self.get(category_id)
        self.db.delete(category)
        self.db.commit()
