#!/usr/bin/env python3
"""
Add sub-hobbies to the database
Creates a hierarchical hobby structure with parent-child relationships
"""

import sqlite3
import json
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "app.db"

def get_db_connection():
    return sqlite3.connect(str(DB_PATH))

def add_sub_hobbies():
    """Add sub-hobbies with hierarchical structure"""
    
    print("🌳 Adding hierarchical sub-hobbies structure...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Hobby structure with icons and colors
    hobby_structure = {
        "Music": {
            "color": "#FF6B6B",
            "icon": "🎵",
            "sub_hobbies": [
                {"name": "Guitar", "icon": "🎸", "color": "#FF8E53"},
                {"name": "Drums", "icon": "🥁", "color": "#FF6B9D"},
                {"name": "Piano", "icon": "🎹", "color": "#C44569"},
                {"name": "Production", "icon": "🎛️", "color": "#F8B500"},
                {"name": "DJ", "icon": "🎧", "color": "#6C5CE7"},
                {"name": "Vocal", "icon": "🎤", "color": "#A29BFE"}
            ]
        },
        "Books & Performing Arts & Cinema": {
            "color": "#4834D4",
            "icon": "📚",
            "sub_hobbies": [
                {"name": "Book", "icon": "📖", "color": "#686DE0"},
                {"name": "Theatre", "icon": "🎭", "color": "#30336B"},
                {"name": "Music", "icon": "🎼", "color": "#95A5A6"},
                {"name": "Tragedy", "icon": "😢", "color": "#2C2C54"},
                {"name": "Science", "icon": "🔬", "color": "#40407A"},
                {"name": "Photography", "icon": "📷", "color": "#706FD3"},
                {"name": "Cinema", "icon": "🎬", "color": "#FF5722"}
            ]
        },
        "Photography": {
            "color": "#00D2D3",
            "icon": "📸",
            "sub_hobbies": [
                {"name": "Shooting", "icon": "📷", "color": "#00CEC9"},
                {"name": "Color Grading", "icon": "🎨", "color": "#81ECEC"},
                {"name": "Photo Editing", "icon": "✂️", "color": "#00B894"}
            ]
        },
        "Videography": {
            "color": "#FD79A8",
            "icon": "🎥",
            "sub_hobbies": []
        },
        "Skateboarding": {
            "color": "#FDCB6E",
            "icon": "🛹",
            "sub_hobbies": [
                {"name": "Skateboard", "icon": "🛹", "color": "#F39C12"},
                {"name": "Fingerboard", "icon": "✋", "color": "#E67E22"}
            ]
        },
        "Cardistry": {
            "color": "#6C5CE7",
            "icon": "🃏",
            "sub_hobbies": [
                {"name": "Cardistry", "icon": "🎴", "color": "#A29BFE"},
                {"name": "Magician", "icon": "🎩", "color": "#74B9FF"}
            ]
        },
        "Fashion": {
            "color": "#E84393",
            "icon": "👗",
            "sub_hobbies": [
                {"name": "Stylist", "icon": "💄", "color": "#FD79A8"},
                {"name": "Watch", "icon": "⌚", "color": "#2D3436"},
                {"name": "Clothing", "icon": "👕", "color": "#00B894"},
                {"name": "Sneaker", "icon": "👟", "color": "#00CEC9"},
                {"name": "High Fashion", "icon": "👠", "color": "#A29BFE"},
                {"name": "Street Style", "icon": "🧢", "color": "#FDCB6E"}
            ]
        },
        "Technology": {
            "color": "#00B894",
            "icon": "💻",
            "sub_hobbies": [
                {"name": "Coding", "icon": "💻", "color": "#00CEC9"},
                {"name": "AI", "icon": "🤖", "color": "#6C5CE7"},
                {"name": "Linux", "icon": "🐧", "color": "#2D3436"}
            ]
        }
    }
    
    # Get existing hobbies
    cursor.execute("SELECT id, name, slug FROM hobbies WHERE parent_id IS NULL")
    existing_hobbies = {row[1]: {"id": row[0], "slug": row[2]} for row in cursor.fetchall()}
    
    total_added = 0
    
    for parent_name, parent_data in hobby_structure.items():
        if parent_name not in existing_hobbies:
            print(f"⚠️  Parent hobby '{parent_name}' not found, skipping...")
            continue
            
        parent_id = existing_hobbies[parent_name]["id"]
        parent_slug = existing_hobbies[parent_name]["slug"]
        
        # Update parent hobby with color and icon
        cursor.execute("""
            UPDATE hobbies 
            SET color = ?, icon = ? 
            WHERE id = ?
        """, (parent_data["color"], parent_data["icon"], parent_id))
        
        print(f"🎨 Updated parent hobby: {parent_name}")
        
        # Add sub-hobbies
        for i, sub_hobby in enumerate(parent_data["sub_hobbies"]):
            sub_name = sub_hobby["name"]
            sub_icon = sub_hobby["icon"]
            sub_color = sub_hobby["color"]
            sub_slug = f"{parent_slug}-{sub_name.lower().replace(' ', '-').replace('&', 'and')}"
            
            # Check if sub-hobby already exists
            cursor.execute("""
                SELECT id FROM hobbies 
                WHERE name = ? AND parent_id = ?
            """, (sub_name, parent_id))
            
            if cursor.fetchone():
                print(f"   ↳ Sub-hobby '{sub_name}' already exists, skipping...")
                continue
            
            # Insert sub-hobby
            cursor.execute("""
                INSERT INTO hobbies (parent_id, name, slug, icon, color, position, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (parent_id, sub_name, sub_slug, sub_icon, sub_color, i))
            
            total_added += 1
            print(f"   ✅ Added: {sub_name} ({sub_icon})")
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Successfully added {total_added} sub-hobbies!")
    print("📊 Hobby structure updated with hierarchical relationships")
    
    return total_added

def show_hobby_tree():
    """Display the current hobby tree structure"""
    
    print("\n🌳 Current Hobby Tree Structure:")
    print("=" * 50)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all hobbies with parent-child relationships
    cursor.execute("""
        SELECT h1.name as parent_name, h1.icon as parent_icon, h1.color as parent_color,
               h2.name as child_name, h2.icon as child_icon, h2.color as child_color
        FROM hobbies h1
        LEFT JOIN hobbies h2 ON h2.parent_id = h1.id
        WHERE h1.parent_id IS NULL
        ORDER BY h1.position, h1.name, h2.position, h2.name
    """)
    
    current_parent = None
    
    for row in cursor.fetchall():
        parent_name, parent_icon, parent_color, child_name, child_icon, child_color = row
        
        if current_parent != parent_name:
            print(f"\n{parent_icon} {parent_name}")
            current_parent = parent_name
        
        if child_name:
            print(f"├── {child_icon} {child_name}")
    
    conn.close()
    print("\n" + "=" * 50)

if __name__ == "__main__":
    print("🚀 Hobby Manager - Sub-hobbies Setup")
    print("=" * 40)
    
    # Check if database exists
    if not DB_PATH.exists():
        print("❌ Database not found. Please run npm start first to initialize the database.")
        exit(1)
    
    try:
        # Add sub-hobbies
        added_count = add_sub_hobbies()
        
        # Show current structure
        show_hobby_tree()
        
        print(f"\n✅ Setup complete! Added {added_count} new sub-hobbies.")
        print("🌐 Visit http://localhost:3000 to see the updated hobby structure!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)