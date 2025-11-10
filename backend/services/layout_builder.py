import json
from pathlib import Path
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from backend import models

_LAYOUT_PATH = Path(__file__).resolve().parent / ".." / "layouts" / "layout.json"


def _load_layout() -> Dict:
    with _LAYOUT_PATH.resolve().open("r", encoding="utf-8") as handle:
        return json.load(handle)


def generate_layout(
    db: Session, zone_overrides: Optional[Dict[str, str]] = None
) -> Dict:
    layout = _load_layout()
    warehouse = layout["warehouse"]

    items = (
        db.query(models.SKUItem)
        .order_by(models.SKUItem.priority.desc())
        .all()
    )

    overrides = {k: v for k, v in (zone_overrides or {}).items() if v}

    zone_bands: Dict[str, Dict[str, List[Dict]]] = {
        zone["id"]: {"from": zone["from_m"], "to": zone["to_m"], "items": []}
        for zone in warehouse["zones"]
    }

    for obj in items:
        target_zone = overrides.get(obj.sku_code, obj.zone or "").upper()
        if target_zone not in zone_bands:
            fallback_zone = (obj.zone or "").upper()
            target_zone = fallback_zone if fallback_zone in zone_bands else None
        if not target_zone:
            continue

        zone_bands[target_zone]["items"].append(
            {
                "sku_code": obj.sku_code,
                "product_name": obj.product_name,
                "priority": obj.priority,
                "zone": target_zone,
                "f": obj.f,
                "w": obj.w,
                "s": obj.s,
                "i": obj.i,
            }
        )

    placements = []
    warehouse_width = warehouse["width_m"]
    warehouse_height = warehouse["height_m"]
    
    # Configuration for cell numbering
    BLOCK_ROWS = 2
    BLOCK_COLS = 2
    ROW_COUNT = 4  # number of 2x2 blocks per zone vertically

    for zone_id, band in zone_bands.items():
        band_width = band["to"] - band["from"]
        cols = max(1, int(band_width // 4))
        rows = max(1, int(warehouse_height // 4))

        for idx, entry in enumerate(band["items"]):
            col = idx % cols
            row = idx // cols
            x_m = band["from"] + (col + 0.5) * (band_width / max(1, cols))
            y_m = (row + 0.5) * (warehouse_height / max(1, rows))
            
            # Calculate position ID: Zone-Block-Cell
            # Block number (1-4, from top to bottom)
            block_num = (idx // (BLOCK_COLS * BLOCK_ROWS)) + 1
            # Cell number within block (1-4: top-left=1, top-right=3, bottom-left=2, bottom-right=4)
            cell_in_block = idx % (BLOCK_COLS * BLOCK_ROWS)
            cell_row = cell_in_block // BLOCK_COLS
            cell_col = cell_in_block % BLOCK_COLS
            # Mapping: 0->1, 1->3, 2->2, 3->4 (top-left, top-right, bottom-left, bottom-right)
            cell_mapping = [1, 3, 2, 4]
            cell_num = cell_mapping[cell_in_block]
            
            position_id = f"{zone_id}-{block_num}-{cell_num}"
            
            placements.append(
                {
                    "sku_code": entry["sku_code"],
                    "product_name": entry.get("product_name"),
                    "priority": entry["priority"],
                    "zone": zone_id,
                    "position_id": position_id,
                    "x_m": round(x_m, 2),
                    "y_m": round(y_m, 2),
                }
            )

    return {
        "warehouse": {
            "width_m": warehouse_width,
            "height_m": warehouse_height,
            "zones": warehouse["zones"],
        },
        "placements": placements,
        "counts": {zone: len(data["items"]) for zone, data in zone_bands.items()},
    }
