#!/usr/bin/env python3
"""
Simple test script to verify the API is working
"""

import requests
import json
import sys

def test_api():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Hobby Manager API")
    print("=" * 40)
    
    try:
        # Test health check
        print("📡 Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
        
        # Test version endpoint
        print("📋 Testing version endpoint...")
        response = requests.get(f"{base_url}/api/version")
        if response.status_code == 200:
            version = response.json()
            print(f"✅ Version: {version['version']}")
        else:
            print(f"❌ Version check failed: {response.status_code}")
            return False
        
        # Test hobbies endpoint
        print("📂 Testing hobbies endpoint...")
        response = requests.get(f"{base_url}/api/hobbies/")
        if response.status_code == 200:
            hobbies = response.json()
            print(f"✅ Found {len(hobbies)} hobbies")
            for hobby in hobbies[:3]:  # Show first 3
                print(f"   - {hobby['name']} ({hobby['icon']})")
        else:
            print(f"❌ Hobbies check failed: {response.status_code}")
            return False
        
        # Test entries endpoint
        print("📝 Testing entries endpoint...")
        response = requests.get(f"{base_url}/api/entries/")
        if response.status_code == 200:
            entries = response.json()
            print(f"✅ Found {len(entries)} entries")
            for entry in entries[:3]:  # Show first 3
                print(f"   - {entry['title']} ({entry['type_key']})")
        else:
            print(f"❌ Entries check failed: {response.status_code}")
            return False
        
        # Test search endpoint
        print("🔍 Testing search endpoint...")
        response = requests.get(f"{base_url}/api/search/?q=test")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Search working (found {len(results)} results)")
        else:
            print(f"❌ Search check failed: {response.status_code}")
            return False
        
        # Test admin stats
        print("📊 Testing admin stats...")
        response = requests.get(f"{base_url}/api/admin/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Stats: {stats['total_entries']} entries, {stats['total_hobbies']} hobbies")
        else:
            print(f"❌ Admin stats failed: {response.status_code}")
            return False
        
        print("\n🎉 All API tests passed!")
        print("\n💡 Next steps:")
        print("   - Frontend should be available at http://localhost:3000")
        print("   - API docs at http://localhost:8000/docs")
        print("   - Admin panel at http://localhost:3000/admin")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_api()
    sys.exit(0 if success else 1)