"""
Script to delete old database and recreate with new schema
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import Base, engine
from backend import models

def reset_database():
    print("=" * 60)
    print("Database Reset Script")
    print("=" * 60)
    print()
    
    # Find and delete database files
    db_files = [
        "backend_db.sqlite3",
        "backend/backend_db.sqlite3",
        "./backend_db.sqlite3"
    ]
    
    deleted_count = 0
    for db_file in db_files:
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
                print(f"✅ Deleted: {db_file}")
                deleted_count += 1
            except Exception as e:
                print(f"❌ Failed to delete {db_file}: {e}")
        else:
            print(f"⏭️  Not found: {db_file}")
    
    print()
    print(f"Deleted {deleted_count} database file(s)")
    print()
    
    # Recreate database with new schema
    print("Creating new database with updated schema...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database created successfully!")
        print()
        print("Schema includes:")
        print("  - id (Primary Key)")
        print("  - sku_code (Unique)")
        print("  - product_name (NEW!)")
        print("  - f, w, s, i (metrics)")
        print("  - priority (calculated)")
        print("  - zone (assigned)")
        print()
        print("=" * 60)
        print("✅ Database reset complete!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Restart the backend server")
        print("2. Refresh your browser")
        print("3. Try adding a new SKU")
    except Exception as e:
        print(f"❌ Failed to create database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    reset_database()
