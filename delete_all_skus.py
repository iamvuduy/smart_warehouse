"""
Script to delete all SKUs from the database
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend import models

def delete_all_skus():
    print("=" * 60)
    print("Delete All SKUs Script")
    print("=" * 60)
    print()
    
    db = SessionLocal()
    try:
        # Get all SKUs
        skus = db.query(models.SKUItem).all()
        count = len(skus)
        
        if count == 0:
            print("✅ No SKUs found in database. Already empty!")
            return
        
        print(f"Found {count} SKUs in database:")
        print()
        
        for sku in skus:
            print(f"  - {sku.sku_code}: {sku.product_name or '(no name)'} (Priority: {sku.priority}, Zone: {sku.zone})")
        
        print()
        
        # Delete all SKUs
        for sku in skus:
            db.delete(sku)
        
        db.commit()
        
        print()
        print("=" * 60)
        print(f"✅ Successfully deleted {count} SKUs from database!")
        print("=" * 60)
        print()
        print("Database is now empty. You can add new SKUs from the frontend.")
        
    except Exception as e:
        print(f"❌ Error deleting SKUs: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_all_skus()
