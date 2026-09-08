"""
CYCLONE-OS: alert_engine.py
Deterministic alert state machine.  Only this module transitions alert levels.
Member 2 — Backend / Event / State Architect

Rules (prototype — NOT official IMD criteria):
  GREEN  → YELLOW  when TTI <= 72h AND risk > 30%
  YELLOW → ORANGE  when TTI <= 48h AND risk > 60%
  ORANGE → RED     when TTI <= 24h AND risk > 80%
  RED    stays RED until reset
"""
from __future__ import annotations

from typing import Dict, List, Optional

from schemas import Alert, AlertLevel, ImpactAssessment


# ---------------------------------------------------------------------------
# Transition table (ordered, most severe first)
# ---------------------------------------------------------------------------

_TRANSITIONS = [
    (AlertLevel.RED,    lambda tti, risk: tti is not None and tti <= 24 and risk > 0.80),
    (AlertLevel.ORANGE, lambda tti, risk: tti is not None and tti <= 48 and risk > 0.60),
    (AlertLevel.YELLOW, lambda tti, risk: tti is not None and tti <= 72 and risk > 0.30),
    (AlertLevel.GREEN,  lambda tti, risk: True),  # default
]


def evaluate(impact: ImpactAssessment) -> AlertLevel:
    """Pure function — return the alert level implied by this impact assessment."""
    tti = impact.time_to_impact_hours
    risk = impact.composite_risk
    for level, condition in _TRANSITIONS:
        if condition(tti, risk):
            return level
    return AlertLevel.GREEN


def build_alert(event_id: str, tick: int, impact: ImpactAssessment,
                previous_level: Optional[AlertLevel]) -> Alert:
    """
    Compute a new Alert object.
    `previous_level` is used to populate the `previous_level` field only when
    it actually changed — callers use this to decide whether to log a timeline entry.
    """
    level = evaluate(impact)
    tti = impact.time_to_impact_hours
    risk = impact.composite_risk

    triggered_by: List[str] = []
    if tti is not None:
        triggered_by.append(f"TTI={tti:.0f}h")
    triggered_by.append(f"risk={risk:.0%}")
    if impact.total_exposed_population > 0:
        triggered_by.append(f"exposure={impact.total_exposed_population:,}")

    return Alert(
        event_id=event_id,
        tick=tick,
        level=level,
        previous_level=previous_level if previous_level != level else None,
        tti_hours=tti,
        risk_pct=risk,
        triggered_by=triggered_by,
        debounce_key=f"{event_id}:{tick}:{level.value}",
    )


def has_escalated(alert: Alert) -> bool:
    """True when this alert represents a genuine level change."""
    return alert.previous_level is not None and alert.previous_level != alert.level
