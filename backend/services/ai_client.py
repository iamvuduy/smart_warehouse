import json
import os
from typing import Any, Dict, List, Optional

from openai import OpenAI

_CLIENT: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _CLIENT
    if _CLIENT is not None:
        return _CLIENT

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY environment variable is not set. Cannot call OpenAI API."
        )

    _CLIENT = OpenAI(api_key=api_key)
    return _CLIENT


def build_ai_prompt(
    items: List[Dict[str, Any]], instructions: Optional[str] = None
) -> str:
    lines = [
        "You are an expert warehouse optimization assistant.",
        "Given the SKU metrics below, recommend the optimal zone (A, B, C, or D) for each SKU.",
        "Zones are ordered from fastest dispatch (A) to slowest (D).",
        "",
        "DEFAULT RULES (unless overridden by operator instructions):",
        "- High priority items (priority > 0.7) should be in Zone A or B",
        "- Heavy items (weight > 10) typically go to Zone D for safety",
        "- High-frequency items (f > 150) should be near dispatch (Zone A/B)",
        "- Large volume items (s > 30000) may need specific zones",
        "",
        "OPERATOR INSTRUCTIONS (these override default rules):",
        instructions.strip() if instructions else "None provided - use default rules only",
        "",
        "Respond with JSON containing a 'summary' string and a 'reassignments' array.",
        "Each element must have sku_code, recommended_zone, confidence (0-1), and reason.",
        "The 'reason' field MUST explain which rule or instruction was applied.",
        "Example response: {\"summary\": \"Applied 3 custom rules, reassigned 5 SKUs\", \"reassignments\":[{\"sku_code\":\"SKU1\",\"recommended_zone\":\"A\",\"confidence\":0.95,\"reason\":\"High inbound frequency (f=180) matches operator rule\"}]}",
    ]

    lines.append("SKU data:")
    for item in items:
        lines.append(
            f"- {item['sku_code']}: priority={item['priority']:.4f}, "
            f"zone={item['zone']}, f={item['f']:.2f}, w={item['w']:.2f}, "
            f"s={item['s']:.2f}, i={item['i']:.2f}"
        )

    return "\n".join(lines)


def ask_ai_for_plan(
    items: List[Dict[str, Any]], instructions: Optional[str] = None
) -> Dict[str, Any]:
    """Call OpenAI to obtain optimization suggestions.

    Returns a dictionary with keys 'summary' and 'reassignments'.
    In case of error or missing configuration, falls back to defaults.
    """

    if not items:
        return {"summary": "No SKUs available for optimization.", "reassignments": []}

    try:
        client = _get_client()
    except RuntimeError as exc:
        return {"summary": str(exc), "reassignments": []}

    prompt = build_ai_prompt(items, instructions)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You generate concise, structured warehouse slotting recommendations.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=600,
        )

        content = response.choices[0].message.content if response.choices else ""

        data = json.loads(content) if content else {}
    except Exception as exc:  # pragma: no cover - network/JSON errors
        return {
            "summary": f"AI optimization unavailable: {exc}",
            "reassignments": [],
        }

    summary = data.get("summary") if isinstance(data, dict) else None
    reassignments = data.get("reassignments") if isinstance(data, dict) else None

    if not isinstance(summary, str):
        summary = "AI optimization completed, but no summary provided."
    if not isinstance(reassignments, list):
        reassignments = []

    cleaned: List[Dict[str, Any]] = []
    for entry in reassignments:
        if not isinstance(entry, dict):
            continue
        sku_code = entry.get("sku_code")
        zone = entry.get("recommended_zone") or entry.get("zone")
        if not sku_code or not isinstance(sku_code, str):
            continue
        if not zone or not isinstance(zone, str):
            continue
        cleaned.append(
            {
                "sku_code": sku_code,
                "recommended_zone": zone.strip().upper(),
                "confidence": float(entry.get("confidence", 0.5)),
                "reason": entry.get("reason", ""),
            }
        )

    return {"summary": summary, "reassignments": cleaned}
