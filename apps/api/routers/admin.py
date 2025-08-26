from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func
from typing import List, Dict, Any
from pydantic import BaseModel

from database import get_session
from models import Entry, Hobby, AppSetting

router = APIRouter()

class SystemStats(BaseModel):
    total_entries: int
    total_hobbies: int
    database_size: str
    version: str

class TableInfo(BaseModel):
    name: str
    row_count: int
    columns: List[str]

@router.get("/stats", response_model=SystemStats)
async def get_system_stats(db: AsyncSession = Depends(get_session)):
    # Get counts
    entry_count = await db.execute(select(func.count(Entry.id)))
    hobby_count = await db.execute(select(func.count(Hobby.id)))
    
    # Get version
    version_result = await db.execute(
        select(AppSetting.value).where(AppSetting.key == "version")
    )
    version = version_result.scalar_one_or_none() or "1.0.0"
    
    return SystemStats(
        total_entries=entry_count.scalar(),
        total_hobbies=hobby_count.scalar(),
        database_size="TBD",  # We'll calculate this later
        version=version
    )

@router.get("/tables", response_model=List[TableInfo])
async def get_tables(db: AsyncSession = Depends(get_session)):
    # Get table names
    result = await db.execute(text("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """))
    
    tables = []
    for (table_name,) in result:
        # Get row count
        count_result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        row_count = count_result.scalar()
        
        # Get column info
        columns_result = await db.execute(text(f"PRAGMA table_info({table_name})"))
        columns = [row[1] for row in columns_result]
        
        tables.append(TableInfo(
            name=table_name,
            row_count=row_count,
            columns=columns
        ))
    
    return tables

@router.post("/query")
async def execute_query(
    query: str, 
    db: AsyncSession = Depends(get_session)
):
    """Execute a custom SQL query (read-only for safety)"""
    
    # Basic security check - only allow SELECT statements
    query_upper = query.strip().upper()
    if not query_upper.startswith('SELECT'):
        raise HTTPException(
            status_code=400, 
            detail="Only SELECT queries are allowed"
        )
    
    try:
        result = await db.execute(text(query))
        
        # Convert to list of dictionaries
        rows = []
        if result.returns_rows:
            columns = list(result.keys())
            for row in result:
                rows.append(dict(zip(columns, row)))
        
        return {
            "columns": list(result.keys()) if result.returns_rows else [],
            "rows": rows,
            "row_count": len(rows)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))