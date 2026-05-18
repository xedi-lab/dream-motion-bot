import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

_raw_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost:5432/dreammotion")
# Railway provides postgresql://, asyncpg requires postgresql+asyncpg://
DATABASE_URL = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
