from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    # For now, simple authentication
    # In production, verify against database
    if request.username == "admin" and request.password == "admin":
        return TokenResponse(
            access_token="fake-token", 
            token_type="bearer"
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # For now, return mock user
    return {"username": "admin", "id": 1}