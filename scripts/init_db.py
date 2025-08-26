#!/usr/bin/env python3
"""
Database initialization script for Hobby Manager
Creates SQLite database with optimal settings and schema
"""

import sqlite3
import json
from pathlib import Path
import sys
import os

# Add the api directory to the path
sys.path.append(str(Path(__file__).parent.parent / "apps" / "api"))

def init_database():
    """Initialize SQLite database with optimal settings"""
    
    print("🗄️  Initializing SQLite database...")
    
    # Ensure data directory exists
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Database path
    db_path = data_dir / "app.db"
    
    # Remove existing database if it exists
    if db_path.exists():
        print(f"   Removing existing database: {db_path}")
        db_path.unlink()
    
    # Create connection
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    print("   Setting up optimal SQLite configuration...")
    
    # Enable optimal settings
    cursor.executescript("""
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = -64000;
        PRAGMA temp_store = MEMORY;
        PRAGMA mmap_size = 268435456;
        PRAGMA foreign_keys = ON;
    """)
    
    print("   Creating database schema...")
    
    # Create schema
    cursor.executescript("""
        -- Users table
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            settings_json TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Hobbies table
        CREATE TABLE hobbies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER REFERENCES hobbies(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            icon TEXT,
            color TEXT DEFAULT '#40E0D0',
            config_json TEXT DEFAULT '{}',
            position INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES hobbies(id)
        );
        
        -- Hobby types table
        CREATE TABLE hobby_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            schema_json TEXT NOT NULL,
            ui_config_json TEXT DEFAULT '{}',
            version INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Entries table
        CREATE TABLE entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hobby_id INTEGER NOT NULL REFERENCES hobbies(id),
            type_key TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            content_markdown TEXT,
            tags TEXT,
            is_favorite BOOLEAN DEFAULT 0,
            is_archived BOOLEAN DEFAULT 0,
            view_count INTEGER DEFAULT 0,
            last_viewed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
        );
        
        -- Entry properties table
        CREATE TABLE entry_props (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            key TEXT NOT NULL,
            value_json TEXT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        );
        
        -- Entry media table
        CREATE TABLE entry_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_filename TEXT,
            mime_type TEXT,
            size_bytes INTEGER,
            width INTEGER,
            height INTEGER,
            duration_seconds REAL,
            metadata_json TEXT,
            thumbnail_path TEXT,
            position INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        );
        
        -- Tags table
        CREATE TABLE tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            color TEXT,
            usage_count INTEGER DEFAULT 0
        );
        
        -- Entry tags junction table
        CREATE TABLE entry_tags (
            entry_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (entry_id, tag_id),
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
        
        -- Shelves table
        CREATE TABLE shelves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hobby_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'general',
            view_mode TEXT DEFAULT 'grid',
            sort_by TEXT DEFAULT 'created_at',
            sort_order TEXT DEFAULT 'DESC',
            config_json TEXT DEFAULT '{}',
            position INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
        );
        
        -- Shelf items table
        CREATE TABLE shelf_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shelf_id INTEGER NOT NULL,
            entry_id INTEGER,
            external_url TEXT,
            title TEXT,
            subtitle TEXT,
            cover_url TEXT,
            metadata_json TEXT,
            position INTEGER DEFAULT 0,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        );
        
        -- Activity logs table
        CREATE TABLE activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            details_json TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- App settings table
        CREATE TABLE app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    print("   Creating performance indexes...")
    
    # Create indexes for performance
    create_indexes(cursor)
    
    print("   Setting up FTS5 for search...")
    
    # Setup FTS5
    setup_fts(cursor)
    
    print("   Inserting initial settings...")
    
    # Insert version and initial settings
    cursor.execute("INSERT INTO app_settings (key, value) VALUES ('version', '1.1.0')")
    cursor.execute("INSERT INTO app_settings (key, value) VALUES ('db_version', '1')")
    
    conn.commit()
    conn.close()
    
    print("✅ Database initialized successfully!")

def create_indexes(cursor):
    """Create performance indexes"""
    indexes = [
        "CREATE INDEX idx_hobbies_parent ON hobbies(parent_id)",
        "CREATE INDEX idx_hobbies_slug ON hobbies(slug)",
        "CREATE INDEX idx_entries_hobby ON entries(hobby_id)",
        "CREATE INDEX idx_entries_type ON entries(type_key)",
        "CREATE INDEX idx_entries_favorite ON entries(is_favorite)",
        "CREATE INDEX idx_entries_archived ON entries(is_archived)",
        "CREATE INDEX idx_entries_created ON entries(created_at DESC)",
        "CREATE INDEX idx_entries_created_hobby ON entries(hobby_id, created_at DESC)",
        "CREATE INDEX idx_entry_props_entry ON entry_props(entry_id)",
        "CREATE INDEX idx_entry_props_key ON entry_props(key)",
        "CREATE INDEX idx_entry_media_entry ON entry_media(entry_id)",
        "CREATE INDEX idx_media_entry_type ON entry_media(entry_id, type)",
        "CREATE INDEX idx_tags_slug ON tags(slug)",
        "CREATE INDEX idx_tags_usage ON tags(usage_count DESC)",
        "CREATE INDEX idx_shelves_hobby ON shelves(hobby_id)",
        "CREATE INDEX idx_shelf_items_shelf ON shelf_items(shelf_id)",
        "CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id)",
        "CREATE INDEX idx_activity_date ON activity_logs(created_at DESC)",
    ]
    
    for index in indexes:
        cursor.execute(index)

def setup_fts(cursor):
    """Setup FTS5 with triggers"""
    
    # Create FTS5 virtual table
    cursor.execute("""
        CREATE VIRTUAL TABLE entry_fts USING fts5(
            title, 
            description, 
            content_markdown, 
            tags,
            content=entries,
            content_rowid=id,
            tokenize='porter unicode61'
        );
    """)
    
    # Create triggers to keep FTS in sync
    cursor.executescript("""
        CREATE TRIGGER entry_fts_insert AFTER INSERT ON entries BEGIN
            INSERT INTO entry_fts(rowid, title, description, content_markdown, tags)
            VALUES (new.id, new.title, new.description, new.content_markdown, new.tags);
        END;
        
        CREATE TRIGGER entry_fts_update AFTER UPDATE ON entries BEGIN
            UPDATE entry_fts 
            SET title = new.title, 
                description = new.description,
                content_markdown = new.content_markdown,
                tags = new.tags
            WHERE rowid = new.id;
        END;
        
        CREATE TRIGGER entry_fts_delete AFTER DELETE ON entries BEGIN
            DELETE FROM entry_fts WHERE rowid = old.id;
        END;
    """)

if __name__ == "__main__":
    init_database()