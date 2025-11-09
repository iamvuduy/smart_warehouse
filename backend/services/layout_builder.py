import json
from pathlib import Path
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from .. import models

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

    for zone_id, band in zone_bands.items():
        band_width = band["to"] - band["from"]
        cols = max(1, int(band_width // 4))
        rows = max(1, int(warehouse_height // 4))

        for idx, entry in enumerate(band["items"]):
            col = idx % cols
            row = idx // cols
            x_m = band["from"] + (col + 0.5) * (band_width / max(1, cols))
            y_m = (row + 0.5) * (warehouse_height / max(1, rows))
            placements.append(
                {
                    "sku_code": entry["sku_code"],
                    "priority": entry["priority"],
                    "zone": zone_id,
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
