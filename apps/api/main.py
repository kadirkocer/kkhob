from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database and routers
from database import init_db, close_db, run_migrations
from routers import auth, entries, hobbies, search, admin, media
from middleware.error_handler import AppException

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await run_migrations()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Hobby Manager",
    version="1.0.0",
    description="Personal hobby management application",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response

# Performance timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.detail,
                "request_id": request.state.request_id
            }
        }
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "validation_error",
                "message": str(exc),
                "request_id": request.state.request_id
            }
        }
    )

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Version endpoint
@app.get("/api/version")
async def get_version():
    return {"version": "1.0.0"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(entries.router, prefix="/api/entries", tags=["entries"])
app.include_router(hobbies.router, prefix="/api/hobbies", tags=["hobbies"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(media.router, prefix="/api/media", tags=["media"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)