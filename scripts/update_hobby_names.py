#!/usr/bin/env python3
"""
Update hobby names in the database
"""

import sqlite3
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "app.db"

def get_db_connection():
    return sqlite3.connect(str(DB_PATH))

def update_hobby_names():
    print("🔄 Updating hobby names...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update "Books & Performing Arts & Cinema" to "Books"
    cursor.execute("""
        UPDATE hobbies 
        SET name = 'Books'
        WHERE id = 8
    """)
    
    print("✅ Updated 'Books & Performing Arts & Cinema' to 'Books'")
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print("🎉 Hobby names updated successfully!")

if __name__ == "__main__":
    update_hobby_names()