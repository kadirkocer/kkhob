#!/usr/bin/env python3
"""
Simple script to add Photography hobby to the database
"""
import requests
import json

def add_photography_hobby():
    """Add Photography hobby via API"""
    hobby_data = {
        "name": "Photography",
        "slug": "photography", 
        "icon": "📸",
        "color": "#8B5CF6",
        "position": 1
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/hobbies/",
            headers={"Content-Type": "application/json"},
            json=hobby_data
        )
        
        if response.status_code == 200:
            print("✅ Photography hobby created successfully!")
            print(response.json())
        else:
            print(f"❌ Error creating hobby: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("Make sure the server is running on http://localhost:8000")

if __name__ == "__main__":
    add_photography_hobby()