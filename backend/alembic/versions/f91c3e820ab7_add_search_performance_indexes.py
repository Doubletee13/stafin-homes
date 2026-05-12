"""add search performance indexes

Revision ID: f91c3e820ab7
Revises: b3f2a1c09d8e
Create Date: 2026-05-12 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f91c3e820ab7'
down_revision: Union[str, None] = 'b3f2a1c09d8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add indexes on heavily-filtered columns to improve query performance
    op.create_index('ix_properties_location', 'properties', ['location'], unique=False)
    op.create_index('ix_properties_property_type', 'properties', ['property_type'], unique=False)
    op.create_index('ix_properties_price', 'properties', ['price'], unique=False)
    op.create_index('ix_properties_created_at', 'properties', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_properties_created_at', table_name='properties')
    op.drop_index('ix_properties_price', table_name='properties')
    op.drop_index('ix_properties_property_type', table_name='properties')
    op.drop_index('ix_properties_location', table_name='properties')
