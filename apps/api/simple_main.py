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
    version="1.2.0",
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
    return {"status": "healthy", "version": "1.2.0"}

@app.get("/api/version")
async def get_version():
    return {"version": "1.2.0"}

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
    version = version_row[0] if version_row else "1.2.0"
    
    db.close()
    
    return {
        "total_entries": total_entries,
        "total_hobbies": total_hobbies,
        "database_size": "< 1MB",
        "version": version
    }

@app.get("/api/shelves/")
async def get_shelves(hobby_id: int = None):
    db = get_db()
    cursor = db.cursor()
    
    sql = """
    SELECT s.id, s.hobby_id, s.name, s.description, s.type, s.view_mode, s.sort_by, 
           s.sort_order, s.config_json, s.position, s.created_at, s.updated_at,
           h.name as hobby_name,
           COUNT(si.id) as item_count
    FROM shelves s
    LEFT JOIN hobbies h ON h.id = s.hobby_id
    LEFT JOIN shelf_items si ON si.shelf_id = s.id
    WHERE 1=1
    """
    params = []
    
    if hobby_id:
        sql += " AND s.hobby_id = ?"
        params.append(hobby_id)
    
    sql += " GROUP BY s.id ORDER BY s.position, s.name"
    
    cursor.execute(sql, params)
    shelves = []
    for row in cursor.fetchall():
        shelves.append({
            "id": row[0],
            "hobby_id": row[1],
            "name": row[2],
            "description": row[3],
            "type": row[4],
            "view_mode": row[5],
            "sort_by": row[6],
            "sort_order": row[7],
            "config_json": row[8],
            "position": row[9],
            "created_at": row[10],
            "updated_at": row[11],
            "hobby_name": row[12],
            "item_count": row[13]
        })
    
    db.close()
    return shelves

@app.get("/api/shelves/{shelf_id}/items")
async def get_shelf_items(shelf_id: int, limit: int = 50, offset: int = 0):
    db = get_db()
    cursor = db.cursor()
    
    sql = """
    SELECT si.id, si.shelf_id, si.entry_id, si.external_url, si.title, si.subtitle,
           si.cover_url, si.metadata_json, si.position, si.added_at,
           e.title as entry_title, e.description as entry_description, e.type_key,
           e.created_at as entry_created_at
    FROM shelf_items si
    LEFT JOIN entries e ON e.id = si.entry_id
    WHERE si.shelf_id = ?
    ORDER BY si.position, si.added_at DESC
    LIMIT ? OFFSET ?
    """
    
    cursor.execute(sql, [shelf_id, limit, offset])
    items = []
    for row in cursor.fetchall():
        items.append({
            "id": row[0],
            "shelf_id": row[1],
            "entry_id": row[2],
            "external_url": row[3],
            "title": row[4] or row[10],  # shelf title or entry title
            "subtitle": row[5] or row[11],  # shelf subtitle or entry description
            "cover_url": row[6],
            "metadata_json": row[7],
            "position": row[8],
            "added_at": row[9],
            "entry_title": row[10],
            "entry_description": row[11],
            "type_key": row[12],
            "entry_created_at": row[13]
        })
    
    db.close()
    return items

@app.post("/api/shelves/")
async def create_shelf(shelf_data: dict):
    db = get_db()
    cursor = db.cursor()
    
    sql = """
    INSERT INTO shelves (hobby_id, name, description, type, view_mode, sort_by, sort_order, config_json, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    cursor.execute(sql, [
        shelf_data.get("hobby_id"),
        shelf_data.get("name"),
        shelf_data.get("description", ""),
        shelf_data.get("type", "general"),
        shelf_data.get("view_mode", "grid"),
        shelf_data.get("sort_by", "created_at"),
        shelf_data.get("sort_order", "DESC"),
        shelf_data.get("config_json", "{}"),
        shelf_data.get("position", 0)
    ])
    
    shelf_id = cursor.lastrowid
    db.commit()
    db.close()
    
    return {"id": shelf_id, "message": "Shelf created successfully"}

@app.post("/api/shelves/{shelf_id}/items")
async def add_shelf_item(shelf_id: int, item_data: dict):
    db = get_db()
    cursor = db.cursor()
    
    sql = """
    INSERT INTO shelf_items (shelf_id, entry_id, external_url, title, subtitle, cover_url, metadata_json, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    cursor.execute(sql, [
        shelf_id,
        item_data.get("entry_id"),
        item_data.get("external_url"),
        item_data.get("title"),
        item_data.get("subtitle"),
        item_data.get("cover_url"),
        item_data.get("metadata_json", "{}"),
        item_data.get("position", 0)
    ])
    
    item_id = cursor.lastrowid
    db.commit()
    db.close()
    
    return {"id": item_id, "message": "Item added to shelf successfully"}

@app.get("/api/admin/analytics")
async def get_analytics():
    db = get_db()
    cursor = db.cursor()
    
    # Get overview stats
    cursor.execute("SELECT COUNT(*) FROM entries WHERE is_archived = 0")
    total_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM hobbies WHERE is_active = 1")
    total_hobbies = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM shelves")
    total_shelves = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(view_count) FROM entries")
    total_views = cursor.fetchone()[0] or 0
    
    # Get trends (mock data for now)
    # In a real app, you'd query based on date ranges
    entries_this_week = 12
    entries_last_week = 8
    views_this_week = 89
    views_last_week = 76
    
    # Get top entries
    cursor.execute("""
        SELECT e.id, e.title, e.view_count, h.name as hobby_name
        FROM entries e
        JOIN hobbies h ON h.id = e.hobby_id
        WHERE e.is_archived = 0
        ORDER BY e.view_count DESC
        LIMIT 10
    """)
    
    top_entries = []
    for row in cursor.fetchall():
        top_entries.append({
            "id": row[0],
            "title": row[1],
            "views": row[2],
            "hobby": row[3]
        })
    
    # Get hobby activity
    cursor.execute("""
        SELECT h.name, COUNT(e.id) as entry_count, MAX(e.created_at) as last_activity
        FROM hobbies h
        LEFT JOIN entries e ON e.hobby_id = h.id AND e.is_archived = 0
        WHERE h.is_active = 1
        GROUP BY h.id, h.name
        ORDER BY entry_count DESC
    """)
    
    active_hobbies = []
    for row in cursor.fetchall():
        active_hobbies.append({
            "name": row[0],
            "entryCount": row[1],
            "lastActivity": row[2] or "Never"
        })
    
    db.close()
    
    return {
        "overview": {
            "totalEntries": total_entries,
            "totalHobbies": total_hobbies,
            "totalShelves": total_shelves,
            "totalViews": total_views,
            "storageUsed": "< 1MB",
            "activeUsers": 1
        },
        "trends": {
            "entriesThisWeek": entries_this_week,
            "entriesLastWeek": entries_last_week,
            "viewsThisWeek": views_this_week,
            "viewsLastWeek": views_last_week
        },
        "topContent": {
            "mostViewedEntries": top_entries,
            "popularTags": [
                {"name": "tutorial", "count": 45},
                {"name": "javascript", "count": 32},
                {"name": "photography", "count": 28}
            ],
            "activeHobbies": active_hobbies
        },
        "performance": {
            "averageLoadTime": 245,
            "errorRate": 0.02,
            "uptime": 99.8,
            "databaseQueries": 1247
        }
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