#!/usr/bin/env python3
"""
Update all hobby names to Turkish
"""
import requests
import json
import time

API_BASE = "http://localhost:8000"

def create_turkish_slug(name):
    """Create a Turkish-friendly slug"""
    replacements = {
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U', 
        'ş': 's', 'Ş': 'S',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C',
        ' ': '-'
    }
    
    slug = name.lower()
    for tr_char, en_char in replacements.items():
        slug = slug.replace(tr_char, en_char)
    
    return slug

def update_hobby_names():
    """Update hobby names to Turkish"""
    print("🇹🇷 Updating hobby names to Turkish...")
    
    # Turkish hobby names mapping
    turkish_names = {
        # Parent hobbies
        "Music": {"name": "Müzik", "icon": "🎵"},
        "Books": {"name": "Kitaplar", "icon": "📚"}, 
        "Photography": {"name": "Fotoğrafçılık", "icon": "📸"},
        "Videography": {"name": "Videografi", "icon": "🎥"},
        "Skateboarding": {"name": "Kaykay", "icon": "🛹"},
        "Cardistry": {"name": "Kart Sanatı", "icon": "🃏"},
        "Fashion": {"name": "Moda", "icon": "👗"},
        "Technology": {"name": "Teknoloji", "icon": "💻"},
        
        # Music sub-hobbies
        "Guitar": {"name": "Gitar", "icon": "🎸"},
        "Drums": {"name": "Davul", "icon": "🥁"},
        "Piano": {"name": "Piyano", "icon": "🎹"},
        "Production": {"name": "Prodüksiyon", "icon": "🎛️"},
        "DJ": {"name": "DJ", "icon": "🎧"},
        "Vocal": {"name": "Vokal", "icon": "🎤"},
        
        # Photography sub-hobbies
        "Shooting": {"name": "Çekim", "icon": "📷"},
        "Color Grading": {"name": "Renk Düzeltme", "icon": "🎨"},
        "Photo Editing": {"name": "Fotoğraf Düzenleme", "icon": "✨"},
        
        # Skateboarding sub-hobbies
        "Skateboard": {"name": "Kaykay", "icon": "🛹"},
        "Fingerboard": {"name": "Parmak Kaykayı", "icon": "🤏"},
        
        # Cardistry sub-hobbies - rename the sub one to avoid confusion
        "Cardistry": {"name": "Kart Hileleri", "icon": "🃏"}, 
        "Magician": {"name": "Sihirbazlık", "icon": "🎩"},
        
        # Fashion sub-hobbies
        "Stylist": {"name": "Stilist", "icon": "✂️"},
        "Watch": {"name": "Saat", "icon": "⌚"},
        "Clothing": {"name": "Giyim", "icon": "👕"},
        "Sneaker": {"name": "Spor Ayakkabı", "icon": "👟"},
        "High Fashion": {"name": "Haute Couture", "icon": "👑"},
        "Street Style": {"name": "Sokak Stili", "icon": "🧢"},
        
        # Technology sub-hobbies
        "Coding": {"name": "Kodlama", "icon": "💻"},
        "AI": {"name": "Yapay Zeka", "icon": "🤖"},
        "Linux": {"name": "Linux", "icon": "🐧"}
    }
    
    try:
        # Get all current hobbies
        response = requests.get(f"{API_BASE}/api/hobbies/")
        if response.status_code != 200:
            print(f"❌ Error fetching hobbies: {response.status_code}")
            return
        
        hobbies = response.json()
        print(f"📋 Found {len(hobbies)} hobbies to update")
        
        updated_count = 0
        
        for hobby in hobbies:
            current_name = hobby.get('name', '')
            hobby_id = hobby.get('id')
            
            if current_name in turkish_names:
                turkish_data = turkish_names[current_name]
                turkish_name = turkish_data["name"]
                icon = turkish_data["icon"]
                
                update_data = {
                    "name": turkish_name,
                    "slug": create_turkish_slug(turkish_name),
                    "icon": icon,
                    "color": hobby.get('color', '#666666')
                }
                
                try:
                    response = requests.put(
                        f"{API_BASE}/api/hobbies/{hobby_id}",
                        headers={"Content-Type": "application/json"},
                        json=update_data
                    )
                    
                    if response.status_code == 200:
                        print(f"✅ {current_name} → {turkish_name}")
                        updated_count += 1
                    else:
                        print(f"❌ Failed to update {current_name}: {response.text}")
                        
                except Exception as e:
                    print(f"❌ Error updating {current_name}: {e}")
                
                time.sleep(0.1)  # Small delay between requests
        
        print(f"\n🎉 Successfully updated {updated_count} hobby names to Turkish!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update_hobby_names()