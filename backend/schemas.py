from pydantic import BaseModel, Field
from typing import List, Optional


class SKUCreate(BaseModel):
    sku_code: str = Field(..., example="SKU001")
    product_name: Optional[str] = Field(None, example="Laptop Dell XPS 13")
    f: float = Field(..., ge=0.0, le=1.0, example=0.25)
    w: float = Field(..., ge=0.0, le=1.0, example=0.4)
    s: float = Field(..., ge=0.0, le=1.0, example=0.2)
    i: float = Field(..., ge=0.0, le=1.0, example=0.3)


class SKUItemOut(BaseModel):
    id: int
    sku_code: str
    product_name: Optional[str]
    f: float
    w: float
    s: float
    i: float
    priority: float
    zone: str

    class Config:
        orm_mode = True


class OptimizeRequest(BaseModel):
    instructions: Optional[str] = Field(
        default=None,
        max_length=600,
        description="Optional operator hints passed to the AI model.",
    )


class AIReassignment(BaseModel):
    sku_code: str
    recommended_zone: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: Optional[str] = None


class OptimizeResponse(BaseModel):
    warehouse: dict
    placements: List[dict]
    counts: dict
    assistant_summary: Optional[str] = None
    assistant_reassignments: List[AIReassignment] = Field(default_factory=list)
