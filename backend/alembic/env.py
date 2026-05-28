from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Import Base and all models so Alembic can autogenerate migrations
from app.models.base import Base  # noqa: F401
# Import all models here as they are created:
from app.models.property import Property  # noqa: F401
from app.models.contact import Contact  # noqa: F401

# Alembic Config object
config = context.config

# Set the DB URL dynamically from the app config — never hardcode credentials
from app.core.config import DATABASE_URL
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
