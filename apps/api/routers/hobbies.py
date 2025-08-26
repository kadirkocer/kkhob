from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from typing import Optional

from database import get_session
from models import Hobby

router = APIRouter()

class HobbyResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon: str
    color: str
    parent_id: Optional[int]
    position: int
    is_active: bool
    
    class Config:
        orm_mode = True

class HobbyCreate(BaseModel):
    name: str
    slug: str
    icon: str = "📝"
    color: str = "#40E0D0"
    parent_id: Optional[int] = None
    position: int = 0

@router.get("/", response_model=List[HobbyResponse])
async def get_hobbies(db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Hobby).where(Hobby.is_active == True).order_by(Hobby.position, Hobby.name)
    )
    hobbies = result.scalars().all()
    return [HobbyResponse.from_orm(hobby) for hobby in hobbies]

@router.post("/", response_model=HobbyResponse)
async def create_hobby(hobby_data: HobbyCreate, db: AsyncSession = Depends(get_session)):
    hobby = Hobby(**hobby_data.dict())
    db.add(hobby)
    await db.commit()
    await db.refresh(hobby)
    return HobbyResponse.from_orm(hobby)

@router.get("/{hobby_id}", response_model=HobbyResponse)
async def get_hobby(hobby_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Hobby).where(Hobby.id == hobby_id))
    hobby = result.scalar_one_or_none()
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    return HobbyResponse.from_orm(hobby)