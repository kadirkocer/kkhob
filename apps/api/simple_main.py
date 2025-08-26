#!/usr/bin/env python3
"""
Simple FastAPI app without SQLAlchemy for basic testing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import os
from pathlib import Path

app = FastAPI(
    title="Hobby Manager",
    version="1.1.0",
    description="Personal hobby management application"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple database connection
def get_db():
    db_path = Path("../../data/app.db")
    return sqlite3.connect(str(db_path))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.1.0"}

@app.get("/api/version")
async def get_version():
    return {"version": "1.1.0"}

@app.get("/api/hobbies/")
async def get_hobbies():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, slug, icon, color, parent_id, position, is_active FROM hobbies WHERE is_active = 1 ORDER BY position, name")
    hobbies = []
    for row in cursor.fetchall():
        hobbies.append({
            "id": row[0],
            "name": row[1],
            "slug": row[2],
            "icon": row[3],
            "color": row[4],
            "parent_id": row[5],
            "position": row[6],
            "is_active": bool(row[7])
        })
    db.close()
    return hobbies

@app.get("/api/entries/")
async def get_entries(hobby_id: int = None, limit: int = 50, offset: int = 0):
    db = get_db()
    cursor = db.cursor()
    
    sql = """
    SELECT e.id, e.hobby_id, e.type_key, e.title, e.description, e.content_markdown,
           e.tags, e.is_favorite, e.is_archived, e.view_count, e.created_at, e.updated_at,
           h.name as hobby_name
    FROM entries e
    JOIN hobbies h ON h.id = e.hobby_id
    WHERE e.is_archived = 0
    """
    params = []
    
    if hobby_id:
        sql += " AND e.hobby_id = ?"
        params.append(hobby_id)
    
    sql += " ORDER BY e.created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(sql, params)
    entries = []
    for row in cursor.fetchall():
        entries.append({
            "id": row[0],
            "hobby_id": row[1],
            "type_key": row[2],
            "title": row[3],
            "description": row[4],
            "content_markdown": row[5],
            "tags": row[6],
            "is_favorite": bool(row[7]),
            "is_archived": bool(row[8]),
            "view_count": row[9],
            "created_at": row[10],
            "updated_at": row[11],
            "hobby_name": row[12],
            "props": {}
        })
    
    db.close()
    return entries

@app.get("/api/search/")
async def search_entries(q: str, limit: int = 50):
    if not q or len(q) < 2:
        return []
    
    db = get_db()
    cursor = db.cursor()
    
    search_term = f"%{q}%"
    sql = """
    SELECT e.id, e.title, e.description, e.hobby_id, e.type_key, e.created_at, h.name as hobby_name
    FROM entries e
    JOIN hobbies h ON h.id = e.hobby_id
    WHERE (e.title LIKE ? OR e.description LIKE ? OR e.content_markdown LIKE ? OR e.tags LIKE ?)
    AND e.is_archived = 0
    ORDER BY e.created_at DESC
    LIMIT ?
    """
    
    cursor.execute(sql, [search_term, search_term, search_term, search_term, limit])
    results = []
    for row in cursor.fetchall():
        snippet = row[2][:200] + "..." if row[2] and len(row[2]) > 200 else row[2]
        results.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "hobby_id": row[3],
            "hobby_name": row[6],
            "type_key": row[4],
            "created_at": row[5],
            "snippet": snippet
        })
    
    db.close()
    return results

@app.get("/api/admin/stats")
async def get_system_stats():
    db = get_db()
    cursor = db.cursor()
    
    # Count entries
    cursor.execute("SELECT COUNT(*) FROM entries")
    total_entries = cursor.fetchone()[0]
    
    # Count hobbies
    cursor.execute("SELECT COUNT(*) FROM hobbies WHERE is_active = 1")
    total_hobbies = cursor.fetchone()[0]
    
    # Get version
    cursor.execute("SELECT value FROM app_settings WHERE key = 'version'")
    version_row = cursor.fetchone()
    version = version_row[0] if version_row else "1.1.0"
    
    db.close()
    
    return {
        "total_entries": total_entries,
        "total_hobbies": total_hobbies,
        "database_size": "< 1MB",
        "version": version
    }

@app.get("/api/admin/tables")
async def get_tables():
    db = get_db()
    cursor = db.cursor()
    
    # Get table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    tables = []
    
    for (table_name,) in cursor.fetchall():
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        row_count = cursor.fetchone()[0]
        
        # Get column info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [row[1] for row in cursor.fetchall()]
        
        tables.append({
            "name": table_name,
            "row_count": row_count,
            "columns": columns
        })
    
    db.close()
    return tables

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)