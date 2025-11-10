import sys
from pathlib import Path
from sqlalchemy import Column, Integer, String, Float

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from database import engine, Base

# Define model inline to avoid import issues
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

# Create all tables with the new schema
Base.metadata.create_all(bind=engine)

print('✓ Database tables created/updated successfully with product_name column')
