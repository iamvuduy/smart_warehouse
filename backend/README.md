# Backend - AI Smart Warehouse Optimization (SLAP)

This is a FastAPI backend for the SLAP demo.

Requirements

- Python 3.9+
- Install dependencies:

```
pip install -r requirements.txt
```

- Configure the OpenAI API key (needed for the optimize endpoint):

```
export OPENAI_API_KEY="sk-..."
```

Run

```
uvicorn backend.main:app --reload
```

APIs

- POST /api/sku/add - add SKU (body: sku_code, f, w, s, i)
- GET /api/sku/list - list SKUs sorted by priority desc
- GET /api/sku/visualize - returns warehouse layout and SKU placements
- POST /api/sku/optimize - same as visualize but enriched with GPT plan (`assistant_summary`, `assistant_reassignments`). Accepts optional `instructions` string.
