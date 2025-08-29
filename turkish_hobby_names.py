#!/usr/bin/env python3
"""
Update all hobby names to Turkish
"""
import requests
import json

API_BASE = "http://localhost:8000"

def update_hobby_names():
    """Update hobby names to Turkish"""
    print("🇹🇷 Updating hobby names to Turkish...")
    
    # Turkish hobby names mapping
    turkish_names = {
        # Parent hobbies
        "Music": "Müzik",
        "Books": "Kitaplar", 
        "Photography": "Fotoğrafçılık",
        "Videography": "Videografi",
        "Skateboarding": "Kaykay",
        "Cardistry": "Kart Sanatı",
        "Fashion": "Moda",
        "Technology": "Teknoloji",
        
        # Music sub-hobbies
        "Guitar": "Gitar",
        "Drums": "Davul",
        "Piano": "Piyano",
        "Production": "Prodüksiyon",
        "DJ": "DJ",
        "Vocal": "Vokal",
        
        # Photography sub-hobbies
        "Shooting": "Çekim",
        "Color Grading": "Renk Düzeltme",
        "Photo Editing": "Fotoğraf Düzenleme",
        
        # Skateboarding sub-hobbies
        "Skateboard": "Kaykay",
        "Fingerboard": "Parmak Kaykayı",
        
        # Cardistry sub-hobbies
        "Cardistry": "Kart Sanatı",
        "Magician": "Sihirbazlık",
        
        # Fashion sub-hobbies
        "Stylist": "Stilist",
        "Watch": "Saat",
        "Clothing": "Giyim",
        "Sneaker": "Spor Ayakkabı",
        "High Fashion": "Haute Couture",
        "Street Style": "Sokak Stili",
        
        # Technology sub-hobbies
        "Coding": "Kodlama",
        "AI": "Yapay Zeka",
        "Linux": "Linux"
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
            if current_name in turkish_names:
                turkish_name = turkish_names[current_name]
                
                # Create a simple update by recreating the hobby (since we don't have an update endpoint)
                print(f"🔄 {current_name} → {turkish_name}")
                
                # For now, just print what would be updated
                # In a real implementation, you'd call an update API endpoint
                updated_count += 1
        
        print(f"\n✅ Would update {updated_count} hobby names to Turkish")
        print("Note: To fully implement this, we need an update API endpoint")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update_hobby_names()