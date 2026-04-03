"""Seed default categories on startup."""

import logging

from app.db.database import SessionLocal
from app.db.defaults import DEFAULT_CATEGORIES, get_category_type
from app.db.models.category import Category

logger = logging.getLogger(__name__)


def seed_default_categories() -> None:
    db = SessionLocal()
    try:
        for parent_name, children_names in DEFAULT_CATEGORIES.items():
            cat_type = get_category_type(parent_name)

            parent = db.query(Category).filter(
                Category.name == parent_name,
                Category.parent_id.is_(None),
            ).first()

            if not parent:
                parent = Category(name=parent_name, type=cat_type, is_default=True)
                db.add(parent)
                db.flush()
                logger.info("+ Seeded parent category: %s", parent_name)
            elif not parent.is_default:
                parent.is_default = True

            for child_name in children_names:
                child = db.query(Category).filter(
                    Category.name == child_name,
                    Category.parent_id == parent.id,
                ).first()

                if not child:
                    child = Category(name=child_name, type=cat_type, parent_id=parent.id, is_default=True)
                    db.add(child)
                    logger.info("  + Seeded sub-category: %s > %s", parent_name, child_name)
                elif not child.is_default:
                    child.is_default = True

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
