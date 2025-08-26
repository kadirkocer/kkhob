from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_session
from models import Entry, Hobby

router = APIRouter()

class SearchResult(BaseModel):
    id: int
    title: str
    description: str | None
    hobby_id: int
    hobby_name: str
    type_key: str
    created_at: datetime
    snippet: str | None = None
    rank: float | None = None

@router.get("/", response_model=List[SearchResult])
async def search_entries(
    q: str = Query(..., description="Search query"),
    hobby_id: Optional[int] = Query(None, description="Filter by hobby"),
    type_key: Optional[str] = Query(None, description="Filter by entry type"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_session)
):
    if not q.strip():
        return []
    
    # For now, use simple LIKE search until FTS5 is set up
    search_term = f"%{q}%"
    
    query = (
        select(Entry, Hobby.name.label("hobby_name"))
        .join(Hobby, Entry.hobby_id == Hobby.id)
        .where(
            (Entry.title.ilike(search_term)) |
            (Entry.description.ilike(search_term)) |
            (Entry.content_markdown.ilike(search_term)) |
            (Entry.tags.ilike(search_term))
        )
        .where(Entry.is_archived == False)
        .order_by(Entry.created_at.desc())
    )
    
    if hobby_id:
        query = query.where(Entry.hobby_id == hobby_id)
    if type_key:
        query = query.where(Entry.type_key == type_key)
    
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    
    results = []
    for entry, hobby_name in result:
        results.append(SearchResult(
            id=entry.id,
            title=entry.title,
            description=entry.description,
            hobby_id=entry.hobby_id,
            hobby_name=hobby_name,
            type_key=entry.type_key,
            created_at=entry.created_at,
            snippet=entry.description[:200] + "..." if entry.description and len(entry.description) > 200 else entry.description
        ))
    
    return results