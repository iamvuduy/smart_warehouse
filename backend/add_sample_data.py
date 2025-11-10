import sys
from pathlib import Path
from sqlalchemy import Column, Integer, String, Float

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from database import SessionLocal, Base

# Define model inline
class SKUItem(Base):
    __tablename__ = "sku_items"
    id = Column(Integer, primary_key=True, index=True)
    sku_code = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=True)
    f = Column(Float, default=0.0)
    w = Column(Float, default=0.0)
    s = Column(Float, default=0.0)
    i = Column(Float, default=0.0)
    priority = Column(Float, default=0.0)
    zone = Column(String, default="D")

def calculate_priority(f, w, s, i):
    """Calculate priority score"""
    return 0.4 * f + 0.3 * w + 0.2 * s + 0.1 * i

# Sample data
sample_skus = [
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

def normalize_inputs(raw_f, raw_w, raw_s, raw_i):
    """Normalize input values to 0-1 scale"""
    # F -> /200, W -> /20, S -> /50000, I -> /20
    f = min(1.0, raw_f / 200.0)
    w = min(1.0, raw_w / 20.0)
    s = min(1.0, raw_s / 50000.0)
    i = min(1.0, raw_i / 20.0)
    return f, w, s, i

def add_sample_data():
    db = SessionLocal()
    try:
        added_count = 0
        updated_count = 0
        
        for sku_data in sample_skus:
            # Normalize values
            f, w, s, i = normalize_inputs(
                sku_data["f"],
                sku_data["w"],
                sku_data["s"],
                sku_data["i"]
            )
            
            # Calculate priority
            priority = calculate_priority(f, w, s, i)
            
            # Determine zone based on priority
            if priority >= 0.75:
                zone = "A"
            elif priority >= 0.5:
                zone = "B"
            elif priority >= 0.25:
                zone = "C"
            else:
                zone = "D"
            
            # Check if SKU already exists
            existing = db.query(SKUItem).filter(SKUItem.sku_code == sku_data["sku_code"]).first()
            
            if existing:
                # Update existing
                existing.product_name = sku_data["product_name"]
                existing.f = f
                existing.w = w
                existing.s = s
                existing.i = i
                existing.priority = priority
                existing.zone = zone
                updated_count += 1
                print(f"✓ Updated: {sku_data['sku_code']} - {sku_data['product_name']} (Priority: {priority:.4f}, Zone: {zone})")
            else:
                # Add new
                new_item = SKUItem(
                    sku_code=sku_data["sku_code"],
                    product_name=sku_data["product_name"],
                    f=f,
                    w=w,
                    s=s,
                    i=i,
                    priority=priority,
                    zone=zone
                )
                db.add(new_item)
                added_count += 1
                print(f"✓ Added: {sku_data['sku_code']} - {sku_data['product_name']} (Priority: {priority:.4f}, Zone: {zone})")
        
        db.commit()
        print(f"\n{'='*60}")
        print(f"Summary: {added_count} items added, {updated_count} items updated")
        print(f"{'='*60}")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding sample SKU data to database...\n")
    add_sample_data()
    print("\n✓ Done!")
