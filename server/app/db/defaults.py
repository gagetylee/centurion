"""Default category definitions seeded on startup."""

from app.db.models.enums import TransactionType

DEFAULT_CATEGORIES: dict[str, list[str]] = {
    # ── Housing ──────────────────────────────────────────────
    "Housing": [
        "Rent",
        "Mortgage",
        "Property Tax",
        "Home Insurance",
        "Maintenance & Repairs",
        "Furnishings",
    ],

    # ── Utilities ────────────────────────────────────────────
    "Utilities": [
        "Electricity",
        "Gas / Heating",
        "Water & Sewer",
        "Internet",
        "Phone",
    ],

    # ── Food ─────────────────────────────────────────────────
    "Food": [
        "Groceries",
        "Dining Out",
        "Coffee Shops",
        "Takeout & Delivery",
        "Alcohol",
    ],

    # ── Transportation ───────────────────────────────────────
    "Transportation": [
        "Public Transit",
        "Gas",
        "Car Payment",
        "Car Insurance",
        "Parking",
        "Maintenance & Repairs",
        "Ride Share / Taxi",
    ],

    # ── Health & Medical ─────────────────────────────────────
    "Health & Medical": [
        "Doctor / Dentist",
        "Prescriptions",
        "Vision / Optometry",
        "Mental Health",
        "Supplements",
    ],

    # ── Insurance ────────────────────────────────────────────
    "Insurance": [
        "Health Insurance",
        "Life Insurance",
        "Disability Insurance",
        "Tenant / Renters Insurance",
    ],

    # ── Debt Payments ────────────────────────────────────────
    "Debt Payments": [
        "Student Loans",
        "Credit Card Payments",
        "Line of Credit",
        "Personal Loan",
    ],

    # ── Savings & Investments ────────────────────────────────
    "Savings & Investments": [
        "Emergency Fund",
        "TFSA",
        "RRSP",
        "Non-Registered / Brokerage",
        "FHSA",
    ],

    # ── Personal Care ────────────────────────────────────────
    "Personal Care": [
        "Haircuts & Grooming",
        "Clothing & Shoes",
        "Laundry & Dry Cleaning",
        "Skincare & Hygiene",
    ],

    # ── Fitness & Recreation ─────────────────────────────────
    "Fitness & Recreation": [
        "Gym Membership",
        "Hockey",
        "Sports Equipment",
        "Other Recreation",
    ],

    # ── Subscriptions & Memberships ──────────────────────────
    "Subscriptions & Memberships": [
        "Streaming Services",
        "Software & Apps",
        "News / Media",
        "Cloud Storage",
        "Other Memberships",
    ],

    # ── Entertainment ────────────────────────────────────────
    "Entertainment": [
        "Events & Concerts",
        "Movies & Shows",
        "Books & Media",
        "Hobbies",
        "Gaming",
    ],

    # ── Education & Development ──────────────────────────────
    "Education & Development": [
        "Courses & Certifications",
        "Books & Learning Materials",
        "Language Learning",
        "Conferences & Events",
    ],

    # ── Travel ───────────────────────────────────────────────
    "Travel": [
        "Flights",
        "Accommodation",
        "Travel Insurance",
        "Activities & Tours",
        "Travel Food & Drink",
    ],

    # ── Gifts & Donations ────────────────────────────────────
    "Gifts & Donations": [
        "Gifts",
        "Charitable Donations",
    ],

    # ── Fees & Charges ───────────────────────────────────────
    "Fees & Charges": [
        "Bank Fees",
        "ATM Fees",
        "Currency Exchange Fees",
        "Late Fees & Penalties",
    ],

    # ── Taxes ────────────────────────────────────────────────
    "Taxes": [
        "Income Tax (Federal)",
        "Income Tax (Provincial)",
        "Tax Preparation",
    ],

    # ── Miscellaneous ────────────────────────────────────────
    "Miscellaneous": [
        "One-Time Purchases",
        "Uncategorized",
    ],

    # ── Income (for tracking inflows) ────────────────────────
    "Income": [
        "Salary",
        "Bonus",
        "Freelance / Side Income",
        "Investment Income",
        "Tax Refund",
        "Other Income",
    ],
}

INCOME_CATEGORIES = {"Income"}


def get_category_type(parent_name: str) -> TransactionType:
    return TransactionType.income if parent_name in INCOME_CATEGORIES else TransactionType.expense
