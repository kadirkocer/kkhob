from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from database import get_session
from models import Entry, EntryProp, Hobby

router = APIRouter()

class EntryResponse(BaseModel):
    id: int
    hobby_id: int
    type_key: str
    title: str
    description: Optional[str]
    content_markdown: Optional[str]
    tags: Optional[str]
    is_favorite: bool
    is_archived: bool
    view_count: int
    created_at: datetime
    updated_at: datetime
    hobby_name: Optional[str] = None
    props: Dict[str, Any] = {}
    
    class Config:
        orm_mode = True

class EntryCreate(BaseModel):
    hobby_id: int
    type_key: str
    title: str
    description: Optional[str] = None
    content_markdown: Optional[str] = None
    tags: List[str] = []
    props: Dict[str, Any] = {}

class EntryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_markdown: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    props: Optional[Dict[str, Any]] = None

@router.get("/", response_model=List[EntryResponse])
async def get_entries(
    hobby_id: Optional[int] = Query(None),
    type_key: Optional[str] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    is_archived: Optional[bool] = Query(None, description="Default excludes archived"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_session)
):
    query = (
        select(Entry, Hobby.name.label("hobby_name"))
        .join(Hobby, Entry.hobby_id == Hobby.id)
        .order_by(Entry.created_at.desc())
    )
    
    # Apply filters
    if hobby_id:
        query = query.where(Entry.hobby_id == hobby_id)
    if type_key:
        query = query.where(Entry.type_key == type_key)
    if is_favorite is not None:
        query = query.where(Entry.is_favorite == is_favorite)
    if is_archived is None:  # Default to exclude archived
        query = query.where(Entry.is_archived == False)
    elif is_archived is not None:
        query = query.where(Entry.is_archived == is_archived)
    
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    
    entries = []
    for entry, hobby_name in result:
        entry_dict = EntryResponse.from_orm(entry).dict()
        entry_dict["hobby_name"] = hobby_name
        
        # Get properties
        props_result = await db.execute(
            select(EntryProp).where(EntryProp.entry_id == entry.id)
        )
        props = {}
        for prop in props_result.scalars():
            import json
            props[prop.key] = json.loads(prop.value_json)
        entry_dict["props"] = props
        
        entries.append(EntryResponse(**entry_dict))
    
    return entries

@router.post("/", response_model=EntryResponse)
async def create_entry(entry_data: EntryCreate, db: AsyncSession = Depends(get_session)):
    # Create main entry
    entry = Entry(
        hobby_id=entry_data.hobby_id,
        type_key=entry_data.type_key,
        title=entry_data.title,
        description=entry_data.description,
        content_markdown=entry_data.content_markdown,
        tags=",".join(entry_data.tags) if entry_data.tags else None
    )
    
    db.add(entry)
    await db.flush()
    
    # Add properties
    import json
    for key, value in entry_data.props.items():
        prop = EntryProp(
            entry_id=entry.id,
            key=key,
            value_json=json.dumps(value)
        )
        db.add(prop)
    
    await db.commit()
    await db.refresh(entry)
    
    # Return with hobby name
    hobby_result = await db.execute(select(Hobby.name).where(Hobby.id == entry.hobby_id))
    hobby_name = hobby_result.scalar()
    
    entry_dict = EntryResponse.from_orm(entry).dict()
    entry_dict["hobby_name"] = hobby_name
    entry_dict["props"] = entry_data.props
    
    return EntryResponse(**entry_dict)

@router.get("/{entry_id}", response_model=EntryResponse)
async def get_entry(entry_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Entry, Hobby.name.label("hobby_name"))
        .join(Hobby, Entry.hobby_id == Hobby.id)
        .where(Entry.id == entry_id)
    )
    entry_data = result.first()
    if not entry_data:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    entry, hobby_name = entry_data
    
    # Update view count
    entry.view_count += 1
    entry.last_viewed_at = func.now()
    await db.commit()
    
    # Get properties
    props_result = await db.execute(
        select(EntryProp).where(EntryProp.entry_id == entry.id)
    )
    props = {}
    for prop in props_result.scalars():
        import json
        props[prop.key] = json.loads(prop.value_json)
    
    entry_dict = EntryResponse.from_orm(entry).dict()
    entry_dict["hobby_name"] = hobby_name
    entry_dict["props"] = props
    
    return EntryResponse(**entry_dict)

@router.put("/{entry_id}", response_model=EntryResponse)
async def update_entry(entry_id: int, entry_data: EntryUpdate, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Entry).where(Entry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Update fields
    update_data = entry_data.dict(exclude_unset=True)
    props = update_data.pop("props", None)
    tags = update_data.pop("tags", None)
    
    if tags is not None:
        update_data["tags"] = ",".join(tags) if tags else None
    
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    # Update properties if provided
    if props is not None:
        # Delete existing props
        from sqlalchemy import delete
        await db.execute(
            delete(EntryProp).where(EntryProp.entry_id == entry_id)
        )
        
        # Add new props
        import json
        for key, value in props.items():
            prop = EntryProp(
                entry_id=entry.id,
                key=key,
                value_json=json.dumps(value)
            )
            db.add(prop)
    
    await db.commit()
    await db.refresh(entry)
    
    return await get_entry(entry_id, db)

@router.delete("/{entry_id}")
async def delete_entry(entry_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Entry).where(Entry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    from sqlalchemy import delete
    await db.execute(delete(Entry).where(Entry.id == entry_id))
    await db.commit()
    
    return {"message": "Entry deleted successfully"}