from typing import Tuple


def calculate_priority(f: float, w: float, s: float, i: float) -> float:
    """Compute Priority according to weights.

    Priority = 0.38*F + 0.24*W + 0.20*S + 0.18*I
    Returns float in 0..1 (assuming inputs normalized).
    """
    priority = 0.38 * f + 0.24 * w + 0.20 * s + 0.18 * i
    # clamp
    if priority < 0:
        priority = 0.0
    if priority > 1:
        priority = 1.0
    return round(priority, 4)


def priority_to_zone(priority: float) -> str:
    if priority >= 0.7:
        return "A"
    if priority >= 0.5:
        return "B"
    if priority >= 0.3:
        return "C"
    return "D"
