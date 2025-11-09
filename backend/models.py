from sqlalchemy import Column, Integer, String, Float
from .database import Base


class SKUItem(Base):
    __tablename__ = "sku_items"

    id = Column(Integer, primary_key=True, index=True)
    sku_code = Column(String, unique=True, index=True, nullable=False)
    f = Column(Float, default=0.0)
    w = Column(Float, default=0.0)
    s = Column(Float, default=0.0)
    i = Column(Float, default=0.0)
    priority = Column(Float, default=0.0)
    zone = Column(String, default="D")
