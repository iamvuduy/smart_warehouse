"""
Simple test to verify backend is working and can serve SKU list
Run this while backend server is running in another terminal
"""
import requests
import json

try:
    response = requests.get("http://localhost:8000/api/sku/list", timeout=5)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ SUCCESS! Got {len(data)} SKU items")
        print("\nFirst 3 items:")
        for item in data[:3]:
            print(f"  - {item['sku_code']}: {item.get('product_name', 'N/A')}")
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("\n❌ Cannot connect to backend!")
    print("Make sure backend is running on http://localhost:8000")
    print("\nTo start backend, run in a separate terminal:")
    print("  cd backend")
    print("  python -m uvicorn main:app --reload --port 8000")
except Exception as e:
    print(f"\n❌ Error: {e}")
