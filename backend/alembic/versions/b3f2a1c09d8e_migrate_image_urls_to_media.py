"""migrate image_urls to media on properties

Revision ID: b3f2a1c09d8e
Revises: 145620c0286e
Create Date: 2026-05-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'b3f2a1c09d8e'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Add new 'media' column
    op.add_column('properties', sa.Column('media', sa.JSON(), nullable=True))

    # Step 2: Migrate existing data from image_urls -> media
    # Each image URL becomes {"type": "image", "url": "<url>"}
    conn = op.get_bind()
    rows = conn.execute(text("SELECT id, image_urls FROM properties WHERE image_urls IS NOT NULL")).fetchall()
    for row in rows:
        prop_id = row[0]
        image_urls = row[1]
        if image_urls and isinstance(image_urls, list):
            media = [{"type": "image", "url": url} for url in image_urls if url]
            conn.execute(
                text("UPDATE properties SET media = :media WHERE id = :id"),
                {"media": __import__('json').dumps(media), "id": prop_id}
            )

    # Step 3: Drop the old image_urls column
    op.drop_column('properties', 'image_urls')


def downgrade() -> None:
    # Step 1: Re-add image_urls column
    op.add_column('properties', sa.Column('image_urls', sa.JSON(), nullable=True))

    # Step 2: Migrate media back to image_urls (images only)
    conn = op.get_bind()
    rows = conn.execute(text("SELECT id, media FROM properties WHERE media IS NOT NULL")).fetchall()
    import json
    for row in rows:
        prop_id = row[0]
        media = row[1]
        if media and isinstance(media, list):
            image_urls = [item["url"] for item in media if item.get("type") == "image"]
            conn.execute(
                text("UPDATE properties SET image_urls = :image_urls WHERE id = :id"),
                {"image_urls": json.dumps(image_urls), "id": prop_id}
            )

    # Step 3: Drop the media column
    op.drop_column('properties', 'media')
