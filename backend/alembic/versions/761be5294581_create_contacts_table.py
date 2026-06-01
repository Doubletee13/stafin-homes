"""create contacts table

Revision ID: 761be5294581
Revises: f91c3e820ab7
Create Date: 2026-05-12 03:16:10.214425

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '761be5294581'
down_revision: Union[str, None] = 'f91c3e820ab7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create contacts table (IF NOT EXISTS is safe for re-runs / manual pre-creation)
    conn = op.get_bind()
    table_exists = conn.execute(
        text("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='contacts')")
    ).scalar()

    if not table_exists:
        op.create_table(
            'contacts',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('phone', sa.String(length=50), nullable=False),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('property_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_contacts_id'), 'contacts', ['id'], unique=False)

    # Drop the redundant property indexes added by the previous migration
    # (they are already defined on the model via index=True and cause duplicate index errors)
    for idx in ['ix_properties_created_at', 'ix_properties_location',
                'ix_properties_price', 'ix_properties_property_type']:
        idx_exists = conn.execute(
            text(f"SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='{idx}')")
        ).scalar()
        if idx_exists:
            op.drop_index(idx, table_name='properties')


def downgrade() -> None:
    op.drop_index(op.f('ix_contacts_id'), table_name='contacts')
    op.drop_table('contacts')

    op.create_index('ix_properties_property_type', 'properties', ['property_type'], unique=False)
    op.create_index('ix_properties_price', 'properties', ['price'], unique=False)
    op.create_index('ix_properties_location', 'properties', ['location'], unique=False)
    op.create_index('ix_properties_created_at', 'properties', ['created_at'], unique=False)
