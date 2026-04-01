"""Seed script to create budget categories and monthly budgets from Gage's budget plan."""

from app.db.database import SessionLocal
from app.db.models.category import Category
from app.db.models.budget import Budget
from app.db.models.enums import TransactionType, BudgetPeriod, BudgetType


CATEGORIES_AND_BUDGETS = [
    # Income
    {"name": "Net Take-Home Pay (TrustFlight)", "type": TransactionType.income, "budget": 5_300_00, "budget_type": BudgetType.fixed},

    # Fixed Expenses
    {"name": "Rent", "type": TransactionType.expense, "budget": 2_000_00, "budget_type": BudgetType.fixed},
    {"name": "Car Loan Payment", "type": TransactionType.expense, "budget": 500_00, "budget_type": BudgetType.fixed},
    {"name": "Internet", "type": TransactionType.expense, "budget": 25_00, "budget_type": BudgetType.fixed},
    {"name": "Gym Membership", "type": TransactionType.expense, "budget": 60_00, "budget_type": BudgetType.fixed},
    {"name": "Claude Pro Subscription", "type": TransactionType.expense, "budget": 30_00, "budget_type": BudgetType.fixed},
    {"name": "Other Subscriptions", "type": TransactionType.expense, "budget": 50_00, "budget_type": BudgetType.fixed},

    # Variable Expenses
    {"name": "Groceries", "type": TransactionType.expense, "budget": 400_00, "budget_type": BudgetType.variable},
    {"name": "Dining Out / Takeout / Coffee", "type": TransactionType.expense, "budget": 200_00, "budget_type": BudgetType.variable},
    {"name": "Transportation", "type": TransactionType.expense, "budget": 150_00, "budget_type": BudgetType.variable},
    {"name": "Entertainment / Hobbies", "type": TransactionType.expense, "budget": 200_00, "budget_type": BudgetType.variable},
    {"name": "Clothing / Fashion", "type": TransactionType.expense, "budget": 100_00, "budget_type": BudgetType.variable},
    {"name": "Personal Care", "type": TransactionType.expense, "budget": 100_00, "budget_type": BudgetType.variable},
]


def seed():
    db = SessionLocal()
    try:
        for entry in CATEGORIES_AND_BUDGETS:
            # Check if category already exists
            existing = db.query(Category).filter(Category.name == entry["name"]).first()
            if existing:
                print(f"  Category '{entry['name']}' already exists, skipping.")
                category = existing
            else:
                category = Category(name=entry["name"], type=entry["type"])
                db.add(category)
                db.flush()
                print(f"+ Created category: {entry['name']}")

            # Check if budget already exists for this category
            existing_budget = db.query(Budget).filter(Budget.category_id == category.id).first()
            if existing_budget:
                print(f"  Budget for '{entry['name']}' already exists, skipping.")
            else:
                budget = Budget(
                    category_id=category.id,
                    amount_cents=entry["budget"],
                    period=BudgetPeriod.monthly,
                    type=entry["budget_type"],
                )
                db.add(budget)
                print(f"+ Created budget: {entry['name']} → ${entry['budget'] / 100:,.2f}/mo")

        db.commit()
        print("\nDone! All categories and budgets seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
