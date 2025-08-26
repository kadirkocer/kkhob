from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import StaticPool
import os
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///../../data/app.db")

class Base(DeclarativeBase):
    pass

# Create engine with optimal SQLite settings
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def init_db():
    """Initialize database with optimal settings"""
    
    # Ensure data directory exists
    data_dir = Path("../../data")
    data_dir.mkdir(exist_ok=True)
    
    # Create media directory
    media_dir = Path(os.getenv("MEDIA_PATH", "../../data/media"))
    media_dir.mkdir(exist_ok=True)
    
    async with engine.begin() as conn:
        # Enable WAL mode and other optimizations
        await conn.execute(text("""
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA cache_size = -64000;
            PRAGMA temp_store = MEMORY;
            PRAGMA mmap_size = 268435456;
            PRAGMA foreign_keys = ON;
        """))
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    """Close database connections"""
    await engine.dispose()

async def run_migrations():
    """Run any necessary migrations"""
    # For now, we'll handle migrations manually
    # In production, you'd use Alembic here
    pass

# Import text for SQL queries
from sqlalchemy import text

async def get_session():
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()