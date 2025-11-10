"""
Script to add 20 SKUs to the warehouse system
Run this after starting the backend server
"""
import requests
import json

API_BASE = "http://localhost:8000/api"

# Define the 20 SKUs with their data
skus = [
    {"sku_code": "SKU01", "product_name": "Power Bank 10,000mAh", "f": 180, "w": 1, "s": 300, "i": 18},
    {"sku_code": "SKU02", "product_name": "ASUS Laptop 15.6''", "f": 60, "w": 2, "s": 5000, "i": 10},
    {"sku_code": "SKU03", "product_name": "Oishi Snack 40g", "f": 200, "w": 1, "s": 80, "i": 20},
    {"sku_code": "SKU04", "product_name": "Stainless Steel Bottle 1L", "f": 150, "w": 1, "s": 900, "i": 14},
    {"sku_code": "SKU05", "product_name": "Mini Vacuum Cleaner", "f": 55, "w": 4, "s": 3500, "i": 9},
    {"sku_code": "SKU06", "product_name": "Men's Sneakers", "f": 110, "w": 2, "s": 4000, "i": 8},
    {"sku_code": "SKU07", "product_name": "Shampoo 650ml", "f": 160, "w": 2, "s": 1200, "i": 19},
    {"sku_code": "SKU08", "product_name": "Hand Sanitizer 500ml", "f": 170, "w": 2, "s": 900, "i": 20},
    {"sku_code": "SKU09", "product_name": "Stainless Knife Set", "f": 25, "w": 3, "s": 1800, "i": 5},
    {"sku_code": "SKU10", "product_name": "School Backpack", "f": 70, "w": 2, "s": 4500, "i": 12},
    {"sku_code": "SKU11", "product_name": "Blender", "f": 40, "w": 5, "s": 6000, "i": 7},
    {"sku_code": "SKU12", "product_name": "Cotton T-shirt", "f": 140, "w": 1, "s": 450, "i": 15},
    {"sku_code": "SKU13", "product_name": "Textbook Grade 10", "f": 180, "w": 1, "s": 700, "i": 17},
    {"sku_code": "SKU14", "product_name": "Wireless Gaming Mouse", "f": 120, "w": 1, "s": 200, "i": 13},
    {"sku_code": "SKU15", "product_name": "Tissue Pack (10 packs)", "f": 160, "w": 2, "s": 2500, "i": 16},
    {"sku_code": "SKU16", "product_name": "55-inch TV", "f": 10, "w": 18, "s": 50000, "i": 3},
    {"sku_code": "SKU17", "product_name": "Induction Cooker", "f": 15, "w": 15, "s": 38000, "i": 4},
    {"sku_code": "SKU18", "product_name": "Bedding Set", "f": 50, "w": 10, "s": 25000, "i": 7},
    {"sku_code": "SKU19", "product_name": "WiFi Security Camera", "f": 95, "w": 1, "s": 700, "i": 12},
    {"sku_code": "SKU20", "product_name": "Body Wash 850ml", "f": 130, "w": 2, "s": 1500, "i": 14},
]

def normalize_inputs(raw):
    """Normalize inputs according to the frontend normalization rules"""
    f = raw["f"]
    w = raw["w"]
    s = raw["s"]
    i = raw["i"]
    
    # Normalize to 0-1 range
    # F: /200, W: /20, S: /50000, I: /20
    f_norm = min(1.0, f / 200) if f > 1 else f
    w_norm = min(1.0, w / 20) if w > 1 else w
    s_norm = min(1.0, s / 50000) if s > 1 else s
    i_norm = min(1.0, i / 20) if i > 1 else i
    
    return {
        "sku_code": raw["sku_code"],
        "product_name": raw["product_name"],
        "f": round(f_norm, 4),
        "w": round(w_norm, 4),
        "s": round(s_norm, 4),
        "i": round(i_norm, 4)
    }

def add_sku(sku_data):
    """Add a single SKU to the system"""
    try:
        normalized = normalize_inputs(sku_data)
        response = requests.post(f"{API_BASE}/sku/add", json=normalized)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {normalized['sku_code']}: {normalized['product_name']}")
            print(f"   Priority: {result['priority']:.4f}, Zone: {result['zone']}")
            print(f"   F={normalized['f']:.4f}, W={normalized['w']:.4f}, S={normalized['s']:.4f}, I={normalized['i']:.4f}")
            return True
        else:
            print(f"❌ {sku_data['sku_code']}: {response.json().get('detail', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"❌ {sku_data['sku_code']}: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("Adding 20 SKUs to Warehouse System")
    print("=" * 80)
    print()
    
    success_count = 0
    failed_count = 0
    
    for sku in skus:
        if add_sku(sku):
            success_count += 1
        else:
            failed_count += 1
        print()
    
    print("=" * 80)
    print(f"Summary: {success_count} added, {failed_count} failed/skipped")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Open http://localhost:5174 in your browser")
    print("2. Click 'Optimize Placement' to see the warehouse layout")
    print("3. View the 'Added SKU Details' section to see all SKUs")

if __name__ == "__main__":
    main()
