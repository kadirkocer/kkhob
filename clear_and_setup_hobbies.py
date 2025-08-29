#!/usr/bin/env python3
"""
Clear existing hobbies and create the new structure
"""
import sqlite3
import requests
import json
import time
from pathlib import Path

DB_PATH = Path("data/app.db")
API_BASE = "http://localhost:8000/api/hobbies/"

def clear_existing_hobbies():
    """Clear all existing hobbies from database"""
    print("🗑️  Clearing existing hobbies...")
    
    try:
        db = sqlite3.connect(str(DB_PATH))
        cursor = db.cursor()
        
        # Clear hobbies table
        cursor.execute("DELETE FROM hobbies")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='hobbies'")  # Reset auto-increment
        
        db.commit()
        db.close()
        
        print("✅ Cleared existing hobbies")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing hobbies: {e}")
        return False

def create_hobby(name, slug, icon, color, parent_id=None, position=0):
    """Create a hobby via API"""
    hobby_data = {
        "name": name,
        "slug": slug,
        "icon": icon,
        "color": color,
        "parent_id": parent_id,
        "position": position
    }
    
    try:
        response = requests.post(
            API_BASE,
            headers={"Content-Type": "application/json"},
            json=hobby_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Created: {name} (ID: {result.get('id', 'unknown')})")
            return result.get('id')
        else:
            print(f"❌ Error creating {name}: {response.status_code}")
            print(response.text)
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error for {name}: {e}")
        return None

def create_hobby_structure():
    """Create the complete hobby structure"""
    print("\n🚀 Creating hobby structure...")
    print("=" * 50)
    
    # Parent hobbies with their details
    parent_hobbies = [
        {"name": "Music", "slug": "music", "icon": "🎵", "color": "#10B981"},
        {"name": "Books", "slug": "books", "icon": "📚", "color": "#3B82F6"},
        {"name": "Photography", "slug": "photography", "icon": "📸", "color": "#8B5CF6"},
        {"name": "Videography", "slug": "videography", "icon": "🎥", "color": "#EF4444"},
        {"name": "Skateboarding", "slug": "skateboarding", "icon": "🛹", "color": "#F59E0B"},
        {"name": "Cardistry", "slug": "cardistry", "icon": "🃏", "color": "#EC4899"},
        {"name": "Fashion", "slug": "fashion", "icon": "👗", "color": "#8B5A2B"},
        {"name": "Technology", "slug": "technology", "icon": "💻", "color": "#6B7280"}
    ]
    
    # Create parent hobbies and store their IDs
    parent_ids = {}
    
    for i, parent in enumerate(parent_hobbies):
        hobby_id = create_hobby(
            name=parent["name"],
            slug=parent["slug"],
            icon=parent["icon"],
            color=parent["color"],
            position=i + 1
        )
        if hobby_id:
            parent_ids[parent["name"]] = hobby_id
        time.sleep(0.2)  # Small delay between requests
    
    print(f"\n📁 Created {len(parent_ids)} parent hobbies")
    print("=" * 50)
    
    # Sub-hobbies structure
    sub_hobbies_structure = {
        "Music": [
            {"name": "Guitar", "slug": "guitar", "icon": "🎸", "color": "#059669"},
            {"name": "Drums", "slug": "drums", "icon": "🥁", "color": "#0D9488"},
            {"name": "Piano", "slug": "piano", "icon": "🎹", "color": "#0891B2"},
            {"name": "Production", "slug": "production", "icon": "🎛️", "color": "#0284C7"},
            {"name": "DJ", "slug": "dj", "icon": "🎧", "color": "#2563EB"},
            {"name": "Vocal", "slug": "vocal", "icon": "🎤", "color": "#7C3AED"}
        ],
        "Photography": [
            {"name": "Shooting", "slug": "shooting", "icon": "📷", "color": "#7C2D92"},
            {"name": "Color Grading", "slug": "color-grading", "icon": "🎨", "color": "#8B5CF6"},
            {"name": "Photo Editing", "slug": "photo-editing", "icon": "✨", "color": "#A855F7"}
        ],
        "Skateboarding": [
            {"name": "Skateboard", "slug": "skateboard", "icon": "🛹", "color": "#D97706"},
            {"name": "Fingerboard", "slug": "fingerboard", "icon": "🤏", "color": "#F59E0B"}
        ],
        "Cardistry": [
            {"name": "Cardistry", "slug": "cardistry-sub", "icon": "🃏", "color": "#DB2777"},
            {"name": "Magician", "slug": "magician", "icon": "🎩", "color": "#EC4899"}
        ],
        "Fashion": [
            {"name": "Stylist", "slug": "stylist", "icon": "✂️", "color": "#A16207"},
            {"name": "Watch", "slug": "watch", "icon": "⌚", "color": "#92400E"},
            {"name": "Clothing", "slug": "clothing", "icon": "👕", "color": "#B45309"},
            {"name": "Sneaker", "slug": "sneaker", "icon": "👟", "color": "#C2410C"},
            {"name": "High Fashion", "slug": "high-fashion", "icon": "👑", "color": "#DC2626"},
            {"name": "Street Style", "slug": "street-style", "icon": "🧢", "color": "#7F1D1D"}
        ],
        "Technology": [
            {"name": "Coding", "slug": "coding", "icon": "💻", "color": "#4B5563"},
            {"name": "AI", "slug": "ai", "icon": "🤖", "color": "#6B7280"},
            {"name": "Linux", "slug": "linux", "icon": "🐧", "color": "#9CA3AF"}
        ]
    }
    
    # Create sub-hobbies
    total_sub_hobbies = 0
    for parent_name, sub_hobbies in sub_hobbies_structure.items():
        if parent_name in parent_ids and sub_hobbies:
            parent_id = parent_ids[parent_name]
            print(f"\n🔗 Creating sub-hobbies for {parent_name}...")
            
            for i, sub_hobby in enumerate(sub_hobbies):
                create_hobby(
                    name=sub_hobby["name"],
                    slug=sub_hobby["slug"],
                    icon=sub_hobby["icon"],
                    color=sub_hobby["color"],
                    parent_id=parent_id,
                    position=i + 1
                )
                total_sub_hobbies += 1
                time.sleep(0.2)
    
    print(f"\n🎯 Hobby structure creation complete!")
    print(f"📊 Summary:")
    print(f"   - Parent hobbies: {len(parent_ids)}")
    print(f"   - Sub-hobbies: {total_sub_hobbies}")
    print(f"   - Total hobbies: {len(parent_ids) + total_sub_hobbies}")
    
    print(f"\n🖼️  Gallery will be available for:")
    print(f"   - Photography (parent) & Videography (parent)")
    print(f"   - Shooting, Color Grading, Photo Editing (Photography subs)")

if __name__ == "__main__":
    print("🏗️  Setting up complete hobby structure...")
    print("Make sure the API server is running on http://localhost:8000")
    print()
    
    # Clear existing hobbies first
    if clear_existing_hobbies():
        print()
        create_hobby_structure()
    else:
        print("❌ Failed to clear existing hobbies. Aborting.")