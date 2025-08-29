#!/usr/bin/env python3
"""
Setup complete hobby structure via API
"""
import requests
import json
import time

API_BASE = "http://localhost:8000"

def clear_hobbies():
    """Clear all existing hobbies"""
    print("🗑️  Clearing existing hobbies...")
    
    try:
        response = requests.delete(f"{API_BASE}/api/hobbies/clear")
        if response.status_code == 200:
            print("✅ Cleared existing hobbies")
            return True
        else:
            print(f"❌ Error clearing hobbies: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
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
            f"{API_BASE}/api/hobbies/",
            headers={"Content-Type": "application/json"},
            json=hobby_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {name}")
            return result.get('id')
        else:
            print(f"❌ Error creating {name}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error for {name}: {e}")
        return None

def main():
    print("🏗️  Setting up hobby structure")
    print("=" * 40)
    
    # Clear existing hobbies
    if not clear_hobbies():
        return
    
    time.sleep(1)
    
    print("\n🎯 Creating parent hobbies...")
    
    # Parent hobbies
    parents = [
        {"name": "Music", "slug": "music", "icon": "🎵", "color": "#10B981"},
        {"name": "Books", "slug": "books", "icon": "📚", "color": "#3B82F6"},
        {"name": "Photography", "slug": "photography", "icon": "📸", "color": "#8B5CF6"},
        {"name": "Videography", "slug": "videography", "icon": "🎥", "color": "#EF4444"},
        {"name": "Skateboarding", "slug": "skateboarding", "icon": "🛹", "color": "#F59E0B"},
        {"name": "Cardistry", "slug": "cardistry", "icon": "🃏", "color": "#EC4899"},
        {"name": "Fashion", "slug": "fashion", "icon": "👗", "color": "#8B5A2B"},
        {"name": "Technology", "slug": "technology", "icon": "💻", "color": "#6B7280"}
    ]
    
    parent_ids = {}
    for i, parent in enumerate(parents):
        hobby_id = create_hobby(
            parent["name"], parent["slug"], parent["icon"], 
            parent["color"], None, i + 1
        )
        if hobby_id:
            parent_ids[parent["name"]] = hobby_id
        time.sleep(0.3)
    
    print(f"\n🔗 Creating sub-hobbies...")
    
    # Sub-hobbies
    sub_hobbies = {
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
    
    total_subs = 0
    for parent_name, subs in sub_hobbies.items():
        if parent_name in parent_ids:
            parent_id = parent_ids[parent_name]
            print(f"\n  📁 {parent_name}:")
            
            for i, sub in enumerate(subs):
                create_hobby(
                    sub["name"], sub["slug"], sub["icon"], 
                    sub["color"], parent_id, i + 1
                )
                total_subs += 1
                time.sleep(0.3)
    
    print(f"\n🎉 Complete!")
    print(f"📊 Created {len(parent_ids)} parents + {total_subs} sub-hobbies")
    print(f"🖼️  Gallery available for Photography & Videography + their subs")

if __name__ == "__main__":
    main()