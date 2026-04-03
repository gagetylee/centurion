"""Seed script to create monthly budgets from Gage's budget plan.

Assumes default categories have already been seeded (via app startup).
"""

import logging

from app.db.database import SessionLocal
from app.db.models.category import Category
from app.db.models.budget import Budget
from app.db.models.enums import BudgetPeriod, BudgetType

logger = logging.getLogger(__name__)


# Maps (parent_name, child_name, budget_cents, budget_type)
# Use None for child_name to target the parent category itself.
BUDGETS = [
    # Income
    ("Income", "Salary", 5_300_00, BudgetType.fixed),

    # Housing
    ("Housing", "Rent", 2_000_00, BudgetType.fixed),
    ("Housing", "Internet", 25_00, BudgetType.fixed),

    # Transportation
    ("Transportation", "Car Payment", 500_00, BudgetType.fixed),

    # Food
    ("Food", "Groceries", 400_00, BudgetType.variable),
    ("Food", "Dining Out", 200_00, BudgetType.variable),

    # Fitness & Recreation
    ("Fitness & Recreation", "Gym Membership", 60_00, BudgetType.fixed),

    # Subscriptions & Memberships
    ("Subscriptions & Memberships", "Software & Apps", 30_00, BudgetType.fixed),
    ("Subscriptions & Memberships", None, 50_00, BudgetType.fixed),

    # Transportation (variable)
    ("Transportation", None, 150_00, BudgetType.variable),

    # Entertainment
    ("Entertainment", None, 200_00, BudgetType.variable),

    # Personal Care
    ("Personal Care", "Clothing & Shoes", 100_00, BudgetType.variable),
    ("Personal Care", None, 100_00, BudgetType.variable),
]


def _find_category(db, parent_name: str, child_name: str | None) -> Category | None:
    if child_name is None:
        return db.query(Category).filter(
            Category.name == parent_name,
            Category.parent_id.is_(None),
        ).first()

    parent = db.query(Category).filter(
        Category.name == parent_name,
        Category.parent_id.is_(None),
    ).first()
    if not parent:
        return None

    return db.query(Category).filter(
        Category.name == child_name,
        Category.parent_id == parent.id,
    ).first()


def seed():
    db = SessionLocal()
    try:
        for parent_name, child_name, amount_cents, budget_type in BUDGETS:
            category = _find_category(db, parent_name, child_name)
            label = f"{parent_name} > {child_name}" if child_name else parent_name

            if not category:
                logger.warning("Category '%s' not found, skipping budget.", label)
                continue

            existing_budget = db.query(Budget).filter(Budget.category_id == category.id).first()
            if existing_budget:
                logger.info("Budget for '%s' already exists, skipping.", label)
            else:
                budget = Budget(
                    category_id=category.id,
                    amount_cents=amount_cents,
                    period=BudgetPeriod.monthly,
                    type=budget_type,
                )
                db.add(budget)
                logger.info("+ Created budget: %s → $%s/mo", label, f"{amount_cents / 100:,.2f}")

        db.commit()
        logger.info("Done! All budgets seeded.")
    except Exception as e:
        db.rollback()
        logger.error("Error seeding budgets: %s", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
