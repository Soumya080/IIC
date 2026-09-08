"""
CYCLONE-OS: events.py
FastAPI router — owns all event/state/replay/intelligence API endpoints.
Business logic is delegated to replay_engine, alert_engine, timeline.
Member 2 — Backend / Event / State Architect
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query

import alert_engine
import replay_engine as re
<<<<<<< HEAD
import timeline as tl
from schemas import (
    AdvanceRequest, AlertLevel, AuditRecord, Basin,
    CreateEventRequest, CycloneEvent, CycloneState,
=======
import rras_engine
import timeline as tl
from schemas import (
    AdvanceRequest, AlertLevel, AuditRecord, Basin,
    CanonicalEventResponse, CreateEventRequest, CycloneEvent, CycloneState,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    EventStatus, Forecast, Hazard, ImpactAssessment,
    OperationalTask, Outcome, ReplayStartRequest,
    Scenario, ScenarioType, TimelineEvent,
)
<<<<<<< HEAD
from seed_data import AMPHAN_TICKS
=======
from seed_data import AMPHAN_TICKS, AMPHAN_EVENT_ID
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

router = APIRouter()


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _utc(s: str) -> datetime:
<<<<<<< HEAD
    return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)
=======
    return datetime.fromisoformat(s.replace("Z", "+00:00")).replace(tzinfo=timezone.utc)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)


def _get_event(event_id: str) -> CycloneEvent:
    ev = re.store.events.get(event_id)
    if not ev:
<<<<<<< HEAD
        raise HTTPException(404, f"Event '{event_id}' not found")
=======
        if event_id in ("DEMO-001", AMPHAN_EVENT_ID):
            re.seed_amphan(event_id)
            ev = re.store.events.get(event_id)
        if not ev:
            raise HTTPException(404, f"Event '{event_id}' not found")
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    return ev


# ===========================================================================
# Event CRUD
# ===========================================================================

@router.get("", response_model=List[CycloneEvent], summary="List all events")
def list_events():
    return list(re.store.events.values())


@router.post("", response_model=CycloneEvent, summary="Create a new event")
def create_event(req: CreateEventRequest):
    eid = req.id or f"CYC-{str(uuid4())[:8].upper()}"
    if eid in re.store.events:
        raise HTTPException(400, f"Event '{eid}' already exists")

    t0 = req.start_time or _utc_now()
    event = CycloneEvent(
        id=eid, name=req.name, status=EventStatus.ACTIVE,
        basin=req.basin, start_time=t0, current_time=t0,
        current_tick=0, max_tick=0, demo_mode=req.demo_mode,
    )
    re.store.events[eid] = event
    for d in [re.store.states, re.store.forecasts, re.store.scenarios,
              re.store.hazards, re.store.impacts, re.store.alerts, re.store.tasks]:
        d[eid] = {}
    tl.init_event(eid)
    return event


@router.get("/{event_id}", response_model=CycloneEvent, summary="Get event by ID")
def get_event(event_id: str):
    return _get_event(event_id)


# ===========================================================================
# State
# ===========================================================================

@router.get("/{event_id}/state", response_model=CycloneState,
            summary="Get canonical state at current tick (or ?tick=N)")
def get_state(event_id: str, tick: Optional[int] = Query(default=None)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    state = re.store.states.get(event_id, {}).get(t)
    if not state:
        raise HTTPException(404, f"No state at tick {t} for event '{event_id}'")
    return state


@router.get("/{event_id}/track", summary="Full historical track up to current tick")
def get_track(event_id: str):
    ev = _get_event(event_id)
    states = re.store.states.get(event_id, {})
    track = [
        {
            "tick": t, "timestamp": s.timestamp.isoformat(),
            "lat": s.lat, "lon": s.lon,
            "intensity_kt": s.intensity_kt, "pressure_hpa": s.pressure_hpa,
            "regime": s.regime.value,
            "movement_speed_kmh": s.movement_speed_kmh,
            "movement_heading_deg": s.movement_heading_deg,
            "data_status": "SIMULATED",
            "source": "IBTrACS+SIMULATED",
        }
        for t, s in sorted(states.items()) if t <= ev.current_tick
    ]
    return {"event_id": event_id, "current_tick": ev.current_tick,
            "track": track, "data_status": "SIMULATED"}


# ===========================================================================
# Forecasts
# ===========================================================================

@router.get("/{event_id}/forecasts", response_model=Forecast,
            summary="Forecast ensemble at current tick (or ?tick=N)")
def get_forecasts(event_id: str, tick: Optional[int] = Query(default=None)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    fc = re.store.forecasts.get(event_id, {}).get(t)
    if not fc:
        raise HTTPException(404, f"No forecast at tick {t}")
    return fc


# ===========================================================================
# Scenarios
# ===========================================================================

@router.get("/{event_id}/scenarios", response_model=List[Scenario],
            summary="Probabilistic scenarios at current tick (or ?tick=N)")
def get_scenarios(event_id: str, tick: Optional[int] = Query(default=None)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    return re.store.scenarios.get(event_id, {}).get(t, [])


# ===========================================================================
# Hazards
# ===========================================================================

@router.get("/{event_id}/hazards", response_model=Hazard,
            summary="GeoJSON wind hazard zones (?scenario=BASE|LEFT|RIGHT)")
def get_hazard(event_id: str,
               tick: Optional[int] = Query(default=None),
               scenario: ScenarioType = Query(default=ScenarioType.BASE)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    state = re.store.states.get(event_id, {}).get(t)
    if not state:
        raise HTTPException(404, f"No state at tick {t}")
    if scenario == ScenarioType.BASE:
        cached = re.store.hazards.get(event_id, {}).get(t)
        if cached:
            return cached
    return re.generate_hazard(event_id, t, state, scenario)


# ===========================================================================
# Impact
# ===========================================================================

@router.get("/{event_id}/impact", response_model=ImpactAssessment,
            summary="Population exposure & risk at current tick (?scenario=BASE|LEFT|RIGHT)")
def get_impact(event_id: str,
               tick: Optional[int] = Query(default=None),
               scenario: ScenarioType = Query(default=ScenarioType.BASE)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    state = re.store.states.get(event_id, {}).get(t)
    if not state:
        raise HTTPException(404, f"No state at tick {t}")
    if scenario == ScenarioType.BASE:
        cached = re.store.impacts.get(event_id, {}).get(t)
        if cached:
            return cached
    return re.generate_impact(event_id, t, state, scenario)


# ===========================================================================
# Operations
# ===========================================================================

@router.get("/{event_id}/operations", response_model=List[OperationalTask],
            summary="Active operational tasks at current tick")
def get_operations(event_id: str, tick: Optional[int] = Query(default=None)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    return re.store.tasks.get(event_id, {}).get(t, [])


<<<<<<< HEAD
=======
@router.get("/{event_id}/rras",
            summary="RRAS road status & depot resource allocation plan at current tick")
def get_rras(event_id: str, tick: Optional[int] = Query(default=None)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick
    rras = re.store.rras.get(event_id, {}).get(t)
    if not rras:
        impact = re.store.impacts.get(event_id, {}).get(t)
        hazard = re.store.hazards.get(event_id, {}).get(t)
        alert = re.store.alerts.get(event_id, {}).get(t)
        if impact and hazard:
            rras = rras_engine.build_rras_output(event_id, t, impact, hazard, alert)
            re.store.rras.setdefault(event_id, {})[t] = rras
    if not rras:
        raise HTTPException(404, f"No RRAS data available at tick {t} for event '{event_id}'")
    return rras


>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
# ===========================================================================
# Timeline
# ===========================================================================

@router.get("/{event_id}/timeline", response_model=List[TimelineEvent],
            summary="Chronological event audit log (?since_tick=0)")
def get_timeline(event_id: str, since_tick: int = Query(default=0)):
    _get_event(event_id)
    return tl.get_timeline(event_id, since_tick)


# ===========================================================================
# Audit
# ===========================================================================

@router.get("/{event_id}/audit", response_model=List[AuditRecord],
            summary="Forecast vs actual audit records")
def get_audit(event_id: str):
    _get_event(event_id)
    return tl.get_audit(event_id)


@router.get("/{event_id}/audit/forecast-skill",
            summary="Forecast skill metrics by lead time (6/12/24/48h)")
def get_forecast_skill(event_id: str):
    _get_event(event_id)
    return tl.get_forecast_skill(event_id)


# ===========================================================================
# Outcome
# ===========================================================================

@router.get("/{event_id}/outcome", response_model=Outcome,
            summary="Final event outcome (landfall, dissipation)")
def get_outcome(event_id: str):
    _get_event(event_id)
    o = re.store.outcomes.get(event_id)
    if not o:
        raise HTTPException(404, "No outcome recorded for this event")
    return o


# ===========================================================================
# Replay — THE CLOCK  (only these endpoints mutate current_tick)
# ===========================================================================

<<<<<<< HEAD
@router.post("/{event_id}/advance", response_model=CycloneEvent,
             summary="Advance replay N steps (body: {steps: 1})")
=======
@router.post("/{event_id}/advance", response_model=CanonicalEventResponse,
             summary="Advance replay N steps and return complete canonical event state")
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
def advance(event_id: str, req: AdvanceRequest = None):
    _get_event(event_id)
    steps = req.steps if req else 1
    try:
        return re.advance(event_id, steps)
    except ValueError as e:
        raise HTTPException(400, str(e))
<<<<<<< HEAD


@router.post("/{event_id}/replay/advance", response_model=CycloneEvent,
=======
    except RuntimeError as e:
        raise HTTPException(502, str(e))


@router.post("/{event_id}/replay/advance", response_model=CanonicalEventResponse,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
             summary="Advance replay by 1 step (no body needed)")
def replay_advance(event_id: str):
    _get_event(event_id)
    try:
        return re.advance(event_id, 1)
    except ValueError as e:
        raise HTTPException(400, str(e))
<<<<<<< HEAD


@router.post("/{event_id}/replay/start", response_model=CycloneEvent,
=======
    except RuntimeError as e:
        raise HTTPException(502, str(e))


@router.post("/{event_id}/replay/start", response_model=CanonicalEventResponse,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
             summary="Jump to a specific tick (body: {from_tick: 3})")
def replay_start(event_id: str, req: ReplayStartRequest = None):
    _get_event(event_id)
    from_tick = req.from_tick if req else 0
    try:
        return re.goto(event_id, from_tick)
    except ValueError as e:
        raise HTTPException(400, str(e))


<<<<<<< HEAD
@router.post("/{event_id}/replay/reset", response_model=CycloneEvent,
=======
@router.post("/{event_id}/replay/reset", response_model=CanonicalEventResponse,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
             summary="Reset replay to T0")
def replay_reset(event_id: str):
    _get_event(event_id)
    try:
        return re.reset(event_id)
    except ValueError as e:
        raise HTTPException(400, str(e))


<<<<<<< HEAD
@router.post("/{event_id}/replay/goto", response_model=CycloneEvent,
=======
@router.post("/{event_id}/replay/goto", response_model=CanonicalEventResponse,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
             summary="Jump directly to tick N (query param: ?tick=5)")
def replay_goto(event_id: str, tick: int = Query(...)):
    _get_event(event_id)
    ev = re.store.events[event_id]
    if tick < 0 or tick > ev.max_tick:
        raise HTTPException(400, f"tick must be 0–{ev.max_tick}")
    try:
        return re.goto(event_id, tick)
    except ValueError as e:
        raise HTTPException(400, str(e))


<<<<<<< HEAD
=======
@router.get("/{event_id}/canonical", response_model=CanonicalEventResponse,
            summary="Unified canonical event state at current tick (or ?tick=N)")
def get_canonical(event_id: str, tick: Optional[int] = Query(default=None)):
    _get_event(event_id)
    try:
        return re.get_canonical_state(event_id, tick)
    except ValueError as e:
        raise HTTPException(400, str(e))


>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
# ===========================================================================
# Unified Intelligence endpoint  (frontend preferred)
# ===========================================================================

@router.get("/{event_id}/intelligence",
            summary="Unified intelligence response — one call gets everything")
def get_intelligence(event_id: str,
                     tick: Optional[int] = Query(default=None),
                     scenario: ScenarioType = Query(default=ScenarioType.BASE)):
    ev = _get_event(event_id)
    t = tick if tick is not None else ev.current_tick

    state = re.store.states.get(event_id, {}).get(t)
    fc = re.store.forecasts.get(event_id, {}).get(t)
    sc = re.store.scenarios.get(event_id, {}).get(t, [])
    hz = re.generate_hazard(event_id, t, state, scenario) if state else None
    imp = (re.store.impacts.get(event_id, {}).get(t)
           if scenario == ScenarioType.BASE
           else (re.generate_impact(event_id, t, state, scenario) if state else None))
    alt = re.store.alerts.get(event_id, {}).get(t)
    tasks = re.store.tasks.get(event_id, {}).get(t, [])
    timeline_entries = tl.get_timeline(event_id, 0)

    return {
        "event":       ev.model_dump(),
        "state":       state.model_dump() if state else None,
        "regime":      state.regime.value if state else None,
        "change_point": (state.change_point.model_dump()
                         if state and state.change_point else None),
        "forecasts":   fc.model_dump() if fc else None,
        "scenarios":   [s.model_dump() for s in sc],
        "hazard":      hz.model_dump() if hz else None,
        "exposure":    imp.model_dump() if imp else None,
        "impact":      imp.model_dump() if imp else None,
        "alert":       alt.model_dump() if alt else None,
        "operations":  [t_.model_dump() for t_ in tasks],
        "timeline":    [e.model_dump() for e in timeline_entries[-20:]],
        "metadata": {
            "tick":        t,
            "max_tick":    ev.max_tick,
            "scenario":    scenario.value,
            "data_status": "SIMULATED",
            "source":      "IBTrACS+SIMULATED+PARAMETRIC_HOLLAND",
            "disclaimer":  "All outputs SIMULATED. Not official IMD data.",
            "generated_at": _utc_now().isoformat(),
        },
    }
