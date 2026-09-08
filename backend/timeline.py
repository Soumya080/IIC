"""
CYCLONE-OS: timeline.py
Owns all timeline event creation and audit logging.
Member 2 — Backend / Event / State Architect
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from schemas import TimelineEvent, TimelineEventType, AuditRecord


# ---------------------------------------------------------------------------
# In-memory timeline store (keyed by event_id)
# ---------------------------------------------------------------------------

_timelines: Dict[str, List[TimelineEvent]] = {}
_audit: Dict[str, List[AuditRecord]] = {}


def init_event(event_id: str) -> None:
    """Initialise empty timeline and audit log for an event."""
    _timelines.setdefault(event_id, [])
    _audit.setdefault(event_id, [])


def get_timeline(event_id: str, since_tick: int = 0) -> List[TimelineEvent]:
    return [e for e in _timelines.get(event_id, []) if e.tick >= since_tick]


def get_audit(event_id: str) -> List[AuditRecord]:
    return list(_audit.get(event_id, []))


def clear_event(event_id: str) -> None:
    """Called by replay reset — wipes runtime entries, keeps tick-0 seeds."""
    entries = _timelines.get(event_id, [])
    _timelines[event_id] = [
        e for e in entries
        if e.tick == 0 and e.type in (
            TimelineEventType.OBSERVATION_RECEIVED,
            TimelineEventType.STATE_UPDATED,
        )
    ]


# ---------------------------------------------------------------------------
# Core log function — the only place TimelineEvents are created
# ---------------------------------------------------------------------------

def log(
    event_id: str,
    tick: int,
    ts: datetime,
    ev_type: TimelineEventType,
    summary: str,
    payload: Optional[Dict[str, Any]] = None,
    severity: str = "INFO",
) -> TimelineEvent:
    evt = TimelineEvent(
        id=str(uuid4()),
        event_id=event_id,
        tick=tick,
        timestamp=ts,
        type=ev_type,
        summary=summary,
        payload=payload or {},
        severity=severity,
    )
    _timelines.setdefault(event_id, []).append(evt)
    return evt


# ---------------------------------------------------------------------------
# Convenience helpers (one per domain event type)
# ---------------------------------------------------------------------------

def log_observation(event_id: str, tick: int, ts: datetime, summary: str) -> TimelineEvent:
    return log(event_id, tick, ts, TimelineEventType.OBSERVATION_RECEIVED, summary, severity="INFO")


def log_state_update(event_id: str, tick: int, ts: datetime,
                     intensity_kt: float, pressure_hpa: float,
                     lat: float, lon: float) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.STATE_UPDATED,
        f"State updated: {intensity_kt:.0f} kt / {pressure_hpa:.0f} hPa @ ({lat:.1f}N, {lon:.1f}E)",
        {"intensity_kt": intensity_kt, "pressure_hpa": pressure_hpa},
    )


def log_regime_change(event_id: str, tick: int, ts: datetime,
                      from_regime: str, to_regime: str) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.REGIME_CHANGED,
        f"Regime changed: {from_regime} -> {to_regime}",
        {"from": from_regime, "to": to_regime},
        severity="WARNING",
    )


def log_change_point(event_id: str, tick: int, ts: datetime,
                     description: str, from_regime: Optional[str],
                     to_regime: Optional[str]) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.CHANGE_POINT_DETECTED,
        f"Change point detected: {description}",
        {"from": from_regime, "to": to_regime},
        severity="WARNING",
    )


def log_alert_change(event_id: str, tick: int, ts: datetime,
                     from_level: str, to_level: str) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.ALERT_CHANGED,
        f"Alert escalated: {from_level} -> {to_level}",
        {"from": from_level, "to": to_level},
        severity="CRITICAL",
    )


def log_impact_update(event_id: str, tick: int, ts: datetime,
                      population: int, tti: Optional[float]) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.IMPACT_UPDATED,
        f"Impact updated: {population:,} exposed, TTI={tti}h",
        {"population": population, "tti": tti},
    )


def log_task(event_id: str, tick: int, ts: datetime,
             task_id: str, title: str, priority: str) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.TASK_ACTIVATED,
        f"Task activated: {title}",
        {"task_id": task_id, "priority": priority},
    )


def log_forecast_update(event_id: str, tick: int, ts: datetime,
                        disagreement: float) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.FORECAST_UPDATED,
        f"Forecast updated (model disagreement={disagreement:.3f})",
        {"disagreement_score": disagreement},
    )


def log_replay_advance(event_id: str, from_tick: int, to_tick: int,
                       ts: datetime) -> TimelineEvent:
    return log(
        event_id, to_tick, ts, TimelineEventType.REPLAY_ADVANCED,
        f"Replay advanced to T{to_tick} ({ts.strftime('%Y-%m-%d %H:%M')}Z)",
        {"from_tick": from_tick, "to_tick": to_tick},
    )


def log_replay_reset(event_id: str, ts: datetime) -> TimelineEvent:
    return log(
        event_id, 0, ts, TimelineEventType.REPLAY_RESET,
        "Replay reset to T0", {}, severity="INFO",
    )


def log_sos(event_id: str, tick: int, ts: datetime,
            district: str, category: str, severity_label: str,
            people: int) -> TimelineEvent:
    return log(
        event_id, tick, ts, TimelineEventType.SOS_RECEIVED,
        f"SOS received: {category} in {district} ({severity_label}), {people} people",
        {"district": district, "severity": severity_label},
    )


# ---------------------------------------------------------------------------
# Audit helpers
# ---------------------------------------------------------------------------

def add_audit(event_id: str, record: AuditRecord) -> None:
    _audit.setdefault(event_id, []).append(record)


def get_forecast_skill(event_id: str) -> Dict[str, Any]:
    records = _audit.get(event_id, [])
    by_lead: Dict[int, Dict] = {}
    for r in records:
        lead = r.lead_hours
        if lead not in by_lead:
            by_lead[lead] = {"track_errors_km": [], "wind_errors_kt": [], "count": 0}
        if r.track_error_km is not None:
            by_lead[lead]["track_errors_km"].append(r.track_error_km)
        if r.intensity_error_kt is not None:
            by_lead[lead]["wind_errors_kt"].append(r.intensity_error_kt)
        by_lead[lead]["count"] += 1

    result = {}
    for lead, d in by_lead.items():
        tk = d["track_errors_km"]
        wk = d["wind_errors_kt"]
        result[f"{lead}h"] = {
            "lead_hours": lead,
            "n_samples": d["count"],
            "mean_track_error_km": round(sum(tk) / len(tk), 2) if tk else None,
            "mean_wind_error_kt": round(sum(wk) / len(wk), 2) if wk else None,
        }
    return result
