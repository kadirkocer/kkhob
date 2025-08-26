#!/usr/bin/env python3
"""
Seed data script for Hobby Manager
Populates the database with initial hobbies, types, and sample entries
"""

import sqlite3
import json
from pathlib import Path
import sys

# Add the api directory to the path
sys.path.append(str(Path(__file__).parent.parent / "apps" / "api"))

# Hobby tree structure from spec
HOBBY_TREE = {
    "Music": {
        "icon": "🎵",
        "color": "#8B5CF6",
        "children": ["Guitar", "Drums", "Piano", "Production", "DJ", "Vocal"],
        "config": {
            "tabs": ["entries", "library", "music", "links"],
            "modules": ["spotify", "soundcloud"],
        }
    },
    "Books & Performing Arts & Cinema": {
        "icon": "📚",
        "color": "#EC4899",
        "children": ["Books", "Theatre", "Music", "Tragedy", "Science", "Photography", "Cinema"],
        "config": {
            "tabs": ["entries", "library", "shelves", "notes"],
            "modules": ["goodreads", "letterboxd"],
        }
    },
    "Photography": {
        "icon": "📷",
        "color": "#F59E0B",
        "children": ["Shooting", "Color Grading", "Photo Editing"],
        "config": {
            "tabs": ["entries", "gallery", "presets", "links"],
            "modules": ["lightroom", "instagram"],
            "gallery": {
                "columns": {"xs": 1, "sm": 2, "md": 3, "lg": 4},
                "aspectRatio": "square"
            }
        }
    },
    "Videography": {
        "icon": "🎬",
        "color": "#EF4444",
        "children": ["Shooting", "Editing", "Color Grading"],
        "config": {
            "tabs": ["entries", "projects", "presets", "links"],
            "modules": ["youtube", "vimeo"],
        }
    },
    "Skateboarding": {
        "icon": "🛹",
        "color": "#10B981",
        "children": ["Street", "Vert", "Equipment"],
        "config": {
            "tabs": ["entries", "tricks", "spots", "links"],
        }
    },
    "Cardistry/Magic": {
        "icon": "🃏",
        "color": "#F59E0B",
        "children": ["Cardistry", "Magic Tricks", "Equipment"],
        "config": {
            "tabs": ["entries", "moves", "tricks", "links"],
        }
    },
    "Fashion": {
        "icon": "👔",
        "color": "#8B5CF6",
        "children": ["Outfits", "Brands", "Styling"],
        "config": {
            "tabs": ["entries", "looks", "brands", "links"],
        }
    },
    "Technology": {
        "icon": "💻",
        "color": "#10B981",
        "children": ["Coding", "AI", "Linux", "Hardware"],
        "config": {
            "tabs": ["entries", "code", "links", "notes"],
            "modules": ["github", "stackoverflow"],
        }
    }
}

# Entry types with JSON schemas
HOBBY_TYPES = [
    {
        "key": "article",
        "name": "Article",
        "schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "format": "uri"},
                "author": {"type": "string"},
                "publication": {"type": "string"},
                "readTime": {"type": "integer", "minimum": 1},
                "highlights": {"type": "array", "items": {"type": "string"}}
            }
        },
        "ui_config": {
            "fields": [
                {"name": "url", "type": "url", "label": "Article URL"},
                {"name": "author", "type": "text", "label": "Author"},
                {"name": "publication", "type": "text", "label": "Publication"},
                {"name": "readTime", "type": "number", "label": "Read Time (minutes)"},
                {"name": "highlights", "type": "array", "label": "Key Highlights"}
            ]
        }
    },
    {
        "key": "photo",
        "name": "Photo",
        "schema": {
            "type": "object",
            "properties": {
                "camera": {"type": "string"},
                "lens": {"type": "string"},
                "iso": {"type": "integer", "minimum": 50, "maximum": 102400},
                "aperture": {"type": "number", "minimum": 0.7, "maximum": 32},
                "shutterSpeed": {"type": "string"},
                "focalLength": {"type": "integer"},
                "location": {"type": "string"},
                "preset": {"type": "string"}
            }
        },
        "ui_config": {
            "fields": [
                {"name": "camera", "type": "text", "label": "Camera"},
                {"name": "lens", "type": "text", "label": "Lens"},
                {"name": "iso", "type": "number", "label": "ISO"},
                {"name": "aperture", "type": "number", "label": "Aperture (f-stop)"},
                {"name": "shutterSpeed", "type": "text", "label": "Shutter Speed"},
                {"name": "focalLength", "type": "number", "label": "Focal Length (mm)"},
                {"name": "location", "type": "text", "label": "Location"},
                {"name": "preset", "type": "text", "label": "Preset Used"}
            ]
        }
    },
    {
        "key": "code_snippet",
        "name": "Code Snippet",
        "schema": {
            "type": "object",
            "required": ["language", "code"],
            "properties": {
                "language": {"type": "string", "enum": ["python", "javascript", "typescript", "rust", "go", "sql"]},
                "code": {"type": "string"},
                "framework": {"type": "string"},
                "dependencies": {"type": "array", "items": {"type": "string"}},
                "github_url": {"type": "string", "format": "uri"}
            }
        }
    },
    {
        "key": "video",
        "name": "Video",
        "schema": {
            "type": "object",
            "properties": {
                "duration": {"type": "integer", "minimum": 1},
                "resolution": {"type": "string", "enum": ["720p", "1080p", "4K", "8K"]},
                "fps": {"type": "integer", "enum": [24, 30, 60, 120, 240]},
                "codec": {"type": "string"},
                "location": {"type": "string"},
                "equipment": {"type": "array", "items": {"type": "string"}}
            }
        }
    },
    {
        "key": "book",
        "name": "Book",
        "schema": {
            "type": "object",
            "properties": {
                "author": {"type": "string"},
                "isbn": {"type": "string"},
                "pages": {"type": "integer", "minimum": 1},
                "genre": {"type": "string"},
                "rating": {"type": "number", "minimum": 0, "maximum": 5},
                "status": {"type": "string", "enum": ["to-read", "reading", "completed"]},
                "notes": {"type": "string"}
            }
        }
    },
    {
        "key": "general",
        "name": "General Note",
        "schema": {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                "status": {"type": "string", "enum": ["draft", "published", "archived"]}
            }
        }
    }
]

# Sample entries
SAMPLE_ENTRIES = [
    {
        "title": "Getting Started with FastAPI",
        "description": "A comprehensive guide to building APIs with FastAPI and Python",
        "type_key": "article",
        "hobby_name": "Technology",
        "tags": ["python", "fastapi", "api", "tutorial"],
        "props": {
            "url": "https://fastapi.tiangolo.com/tutorial/",
            "author": "Sebastian Ramirez",
            "readTime": 45,
            "highlights": ["Type hints", "Automatic documentation", "High performance"]
        }
    },
    {
        "title": "Sunset at Golden Gate",
        "description": "Beautiful golden hour shot of the Golden Gate Bridge",
        "type_key": "photo", 
        "hobby_name": "Photography",
        "tags": ["sunset", "golden-hour", "landscape", "bridge"],
        "props": {
            "camera": "Canon R5",
            "lens": "24-70mm f/2.8",
            "iso": 200,
            "aperture": 8.0,
            "shutterSpeed": "1/60",
            "focalLength": 35,
            "location": "San Francisco, CA",
            "preset": "Golden Hour"
        }
    },
    {
        "title": "React Query Data Fetching",
        "description": "Efficient data fetching pattern with TanStack Query",
        "type_key": "code_snippet",
        "hobby_name": "Technology",
        "tags": ["react", "typescript", "query", "data-fetching"],
        "props": {
            "language": "typescript",
            "framework": "React",
            "dependencies": ["@tanstack/react-query", "axios"],
            "code": "const { data, isLoading, error } = useQuery({\n  queryKey: ['users'],\n  queryFn: fetchUsers\n});"
        }
    },
    {
        "title": "The Clean Code",
        "description": "A handbook of agile software craftsmanship by Robert Martin",
        "type_key": "book",
        "hobby_name": "Books & Performing Arts & Cinema",
        "tags": ["programming", "software-development", "clean-code"],
        "props": {
            "author": "Robert C. Martin",
            "pages": 464,
            "genre": "Programming",
            "rating": 4.5,
            "status": "completed",
            "notes": "Excellent principles for writing maintainable code"
        }
    }
]

def seed_database():
    """Seed the database with initial data"""
    
    print("🌱 Seeding database with initial data...")
    
    # Database path
    data_dir = Path(__file__).parent.parent / "data"
    db_path = data_dir / "app.db"
    
    if not db_path.exists():
        print("❌ Database not found. Please run init_db.py first.")
        sys.exit(1)
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Seed hobbies
    print("   Adding hobbies...")
    hobby_ids = seed_hobbies(cursor, HOBBY_TREE)
    
    # Seed hobby types
    print("   Adding entry types...")
    seed_types(cursor, HOBBY_TYPES)
    
    # Seed sample entries
    print("   Adding sample entries...")
    seed_sample_entries(cursor, SAMPLE_ENTRIES, hobby_ids)
    
    conn.commit()
    conn.close()
    
    print("✅ Database seeded successfully!")

def seed_hobbies(cursor, hobby_tree, parent_id=None, position=0):
    """Recursively seed hobbies"""
    hobby_ids = {}
    
    for name, config in hobby_tree.items():
        # Generate slug
        slug = name.lower().replace(" ", "-").replace("&", "and").replace("/", "-")
        
        # Insert hobby (ignore if already exists)
        cursor.execute("""
            INSERT OR IGNORE INTO hobbies (parent_id, name, slug, icon, color, config_json, position)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            parent_id,
            name,
            slug,
            config.get("icon", "📝"),
            config.get("color", "#40E0D0"),
            json.dumps(config.get("config", {})),
            position
        ))
        
        # Get the hobby ID (whether just inserted or already existed)
        cursor.execute("SELECT id FROM hobbies WHERE slug = ?", (slug,))
        hobby_id = cursor.fetchone()[0]
        hobby_ids[name] = hobby_id
        
        # Add children if they exist
        if "children" in config:
            for child_position, child_name in enumerate(config["children"]):
                child_tree = {child_name: {"icon": "📝", "color": config.get("color", "#40E0D0")}}
                child_ids = seed_hobbies(cursor, child_tree, hobby_id, child_position)
                hobby_ids.update(child_ids)
        
        position += 1
    
    return hobby_ids

def seed_types(cursor, types):
    """Seed hobby types"""
    for type_def in types:
        cursor.execute("""
            INSERT OR IGNORE INTO hobby_types (key, name, schema_json, ui_config_json)
            VALUES (?, ?, ?, ?)
        """, (
            type_def["key"],
            type_def["name"],
            json.dumps(type_def["schema"]),
            json.dumps(type_def.get("ui_config", {}))
        ))

def seed_sample_entries(cursor, entries, hobby_ids):
    """Seed sample entries"""
    for entry_data in entries:
        hobby_id = hobby_ids.get(entry_data["hobby_name"])
        if not hobby_id:
            continue
        
        # Insert entry
        cursor.execute("""
            INSERT INTO entries (hobby_id, type_key, title, description, tags)
            VALUES (?, ?, ?, ?, ?)
        """, (
            hobby_id,
            entry_data["type_key"],
            entry_data["title"],
            entry_data["description"],
            ",".join(entry_data.get("tags", []))
        ))
        
        entry_id = cursor.lastrowid
        
        # Insert properties
        for key, value in entry_data.get("props", {}).items():
            cursor.execute("""
                INSERT INTO entry_props (entry_id, key, value_json)
                VALUES (?, ?, ?)
            """, (entry_id, key, json.dumps(value)))

if __name__ == "__main__":
    seed_database()