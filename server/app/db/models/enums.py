import enum


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


class AccountType(str, enum.Enum):
    checking = "checking"
    savings = "savings"
    credit_card = "credit_card"
    cash = "cash"
    investment = "investment"


class BudgetPeriod(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class BudgetType(str, enum.Enum):
    fixed = "fixed"
    variable = "variable"
