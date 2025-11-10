from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
from pathlib import Path

from backend import models
from backend import schemas
from backend.database import SessionLocal, engine, init_db
from backend.services.priority_calculator import calculate_priority, priority_to_zone
from backend.services.ai_client import ask_ai_for_plan
from backend.services.layout_builder import generate_layout

# Load environment variables from .env file
# Get the backend directory path
backend_dir = Path(__file__).resolve().parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Debug: Print to verify if API key is loaded
print(f"Loading .env from: {env_path}")
print(f"OPENAI_API_KEY loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")

app = FastAPI(title="AI Smart Warehouse Optimization (SLAP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    # create tables
    init_db()


@app.post("/api/sku/add", response_model=schemas.SKUItemOut)
def add_sku(item: schemas.SKUCreate, db: Session = Depends(get_db)):
    # compute priority and zone
    pr = calculate_priority(item.f, item.w, item.s, item.i)
    zone = priority_to_zone(pr)

    # check existing
    existing = db.query(models.SKUItem).filter(models.SKUItem.sku_code == item.sku_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU code already exists")

    db_item = models.SKUItem(
        sku_code=item.sku_code,
        product_name=item.product_name,
        f=item.f,
        w=item.w,
        s=item.s,
        i=item.i,
        priority=pr,
        zone=zone,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.get("/api/sku/list", response_model=list[schemas.SKUItemOut])
def list_skus(db: Session = Depends(get_db)):
    items = db.query(models.SKUItem).order_by(models.SKUItem.priority.desc()).all()
    return items


@app.get("/api/sku/visualize")
def visualize(db: Session = Depends(get_db)):
    return generate_layout(db)


@app.post("/api/sku/optimize", response_model=schemas.OptimizeResponse)
def optimize(
    request: schemas.OptimizeRequest, db: Session = Depends(get_db)
):
    items = (
        db.query(models.SKUItem)
        .order_by(models.SKUItem.priority.desc())
        .all()
    )

    ai_payload = [
        {
            "sku_code": item.sku_code,
            "priority": item.priority,
            "zone": item.zone,
            "f": item.f,
            "w": item.w,
            "s": item.s,
            "i": item.i,
        }
        for item in items
    ]

    ai_plan = ask_ai_for_plan(ai_payload, request.instructions)

    zone_overrides = {
        entry["sku_code"]: entry["recommended_zone"]
        for entry in ai_plan.get("reassignments", [])
        if isinstance(entry, dict)
    }

    layout = generate_layout(db, zone_overrides=zone_overrides)
    layout["assistant_summary"] = ai_plan.get("summary")
    layout["assistant_reassignments"] = ai_plan.get("reassignments", [])
    return layout


@app.delete("/api/sku/{sku_id}")
def delete_sku(sku_id: int, db: Session = Depends(get_db)):
    item = db.query(models.SKUItem).filter(models.SKUItem.id == sku_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="SKU not found")
    db.delete(item)
    db.commit()
    return {"status": "ok", "detail": "deleted"}


@app.put("/api/sku/{sku_id}", response_model=schemas.SKUItemOut)
def update_sku(sku_id: int, item_update: schemas.SKUCreate, db: Session = Depends(get_db)):
    item = db.query(models.SKUItem).filter(models.SKUItem.id == sku_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="SKU not found")

    # update fields
    item.sku_code = item_update.sku_code
    item.product_name = item_update.product_name
    item.f = item_update.f
    item.w = item_update.w
    item.s = item_update.s
    item.i = item_update.i

    # recompute priority and zone
    pr = calculate_priority(item.f, item.w, item.s, item.i)
    zone = priority_to_zone(pr)
    item.priority = pr
    item.zone = zone

    db.add(item)
    db.commit()
    db.refresh(item)
    return item
