"""add_type_to_budgets

Revision ID: 7b8103dee575
Revises: 02c7799a6a68
Create Date: 2026-03-22 17:50:00.892183

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b8103dee575'
down_revision: Union[str, Sequence[str], None] = '02c7799a6a68'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    budget_type = sa.Enum('fixed', 'variable', name='budgettype')
    budget_type.create(op.get_bind(), checkfirst=True)
    op.add_column('budgets', sa.Column('type', budget_type, nullable=True))
    op.execute("UPDATE budgets SET type = 'fixed' WHERE type IS NULL")
    op.alter_column('budgets', 'type', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('budgets', 'type')
    sa.Enum(name='budgettype').drop(op.get_bind(), checkfirst=True)
