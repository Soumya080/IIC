"""
CYCLONE-OS: main.py
Application bootstrap only.
No domain logic lives here — all routes are in their respective routers.
Member 2 — Backend / Event / State Architect

Run:
    uvicorn main:app --reload --port 8000

Swagger:
    http://localhost:8000/docs
"""
from __future__ import annotations

import sys, os
<<<<<<< HEAD
sys.path.insert(0, os.path.dirname(__file__))

=======
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_backend_dir)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from contextlib import asynccontextmanager
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import persistence
import replay_engine as re
import timeline as tl
from events import router as events_router
from map_service import router as map_router
from schemas import (
    NDRFAlert, SOSReport, SOSSubmitRequest, SOSCategory,
    SOSSeverity, SOSStatus, TaskPriority, TimelineEventType,
)
from seed_data import DEMO_RESOURCES


# ---------------------------------------------------------------------------
<<<<<<< HEAD
=======
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    persistence.init_db()
    re.seed_amphan()
    yield


# ---------------------------------------------------------------------------
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="CYCLONE-OS Backend API",
    version="2.0.0",
    description=(
        "CYCLONE-OS backend — one event clock, modular architecture.\n\n"
        "**All outputs are SIMULATED for hackathon demo purposes.**\n"
        "Not official IMD or government data."
    ),
    contact={"name": "Member 2 — Backend / Event / State Architect"},
<<<<<<< HEAD
=======
    lifespan=lifespan,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

# All event / state / replay / intelligence endpoints
app.include_router(events_router, prefix="/api/v1/events", tags=["Events & Replay"])
# MapLibre GL JS backend service endpoints
app.include_router(map_router, prefix="/api/v1/map", tags=["MapLibre Services"])


# ---------------------------------------------------------------------------
<<<<<<< HEAD
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup():
    persistence.init_db()
    re.seed_amphan()


# ---------------------------------------------------------------------------
=======
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
# System routes  (health, demo seed)
# ---------------------------------------------------------------------------

@app.get("/api/v1/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "events_loaded": len(re.store.events),
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "architecture": {
            "main":          "bootstrap only",
            "events":        "event/state/replay/intelligence router",
            "replay_engine": "single event clock",
            "alert_engine":  "deterministic GREEN->RED transitions",
            "timeline":      "append-only audit log",
            "persistence":   "SQLite",
            "providers":     "Intelligence/Hazard/Impact/Ops interfaces",
        },
        "disclaimer": "SIMULATED demo — not official IMD data.",
    }


@app.post("/api/v1/demo/seed", tags=["System"],
          summary="Reset and re-seed all demo data (call before a live pitch)")
def demo_seed():
    eid = "CYC-2020-AMPHAN"
    re.full_reset(eid)
    ev = re.store.events[eid]
    return {
        "status": "seeded",
        "event_id": ev.id,
        "name": ev.name,
        "max_tick": ev.max_tick,
        "ticks_precomputed": len(re.store.states.get(eid, {})),
    }


# ---------------------------------------------------------------------------
# SOS / NDRF   (independent write path — not gated by intelligence pipeline)
# ---------------------------------------------------------------------------

def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


@app.post("/api/v1/sos", tags=["SOS & NDRF"],
          summary="Submit citizen SOS report. DEMO — not a real emergency service.")
def submit_sos(req: SOSSubmitRequest):
    ev = re.store.events.get(req.event_id)
    if not ev:
        raise HTTPException(404, f"Event '{req.event_id}' not found")

    # Deduplication: same district + category within this event
    existing = [r for r in re.store.sos.values()
                if (isinstance(r, dict)
                    and r.get("event_id") == req.event_id
                    and r.get("district") == req.district
                    and r.get("category") == req.category.value)]
    duplicate_of = existing[0]["id"] if existing else None

    sev_weights = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
    report = SOSReport(
        event_id=req.event_id, category=req.category,
        severity=req.severity, lat=req.lat, lon=req.lon,
        district=req.district, people_count=req.people_count,
        description=req.description, contact=req.contact,
        duplicate_of=duplicate_of,
        priority_score=sev_weights.get(req.severity.value, 1) * req.people_count,
    )
    re.store.sos[report.id] = report.model_dump()

    # Route NDRF alert for HIGH/CRITICAL
    ndrf_id = None
    if req.severity in (SOSSeverity.CRITICAL, SOSSeverity.HIGH):
        priority = (TaskPriority.CRITICAL if req.severity == SOSSeverity.CRITICAL
                    else TaskPriority.HIGH)
        target = ("NDRF_COMMAND" if req.severity == SOSSeverity.CRITICAL
                  else "DISTRICT_NDRF_UNIT")
        ndrf = NDRFAlert(
            event_id=req.event_id, sos_id=report.id, priority=priority,
            target_role=target, district=req.district, category=req.category,
            lat=req.lat, lon=req.lon, people_count=req.people_count,
        )
        re.store.ndrf[ndrf.id] = ndrf.model_dump()
        ndrf_id = ndrf.id

    tl.log_sos(req.event_id, ev.current_tick, _utc_now(),
               req.district, req.category.value, req.severity.value, req.people_count)

    return {
        "report_id": report.id,
        "status": "RECEIVED",
        "priority_score": report.priority_score,
        "ndrf_alert_id": ndrf_id,
        "duplicate_of": duplicate_of,
        "disclaimer": "DEMO SOS — not a real emergency line. Dial 112 for real emergencies.",
    }


@app.get("/api/v1/sos", tags=["SOS & NDRF"])
def list_sos(event_id: Optional[str] = None):
    reports = list(re.store.sos.values())
    if event_id:
        reports = [r for r in reports if r.get("event_id") == event_id]
    return {"reports": reports, "count": len(reports)}


@app.get("/api/v1/sos/{sos_id}", tags=["SOS & NDRF"])
def get_sos(sos_id: str):
    r = re.store.sos.get(sos_id)
    if not r:
        raise HTTPException(404, f"SOS report '{sos_id}' not found")
    return r


@app.patch("/api/v1/sos/{sos_id}/status", tags=["SOS & NDRF"])
def update_sos_status(sos_id: str, status: SOSStatus):
    r = re.store.sos.get(sos_id)
    if not r:
        raise HTTPException(404)
    r["status"] = status.value
    return r


@app.get("/api/v1/ndrf-alerts", tags=["SOS & NDRF"])
def list_ndrf_alerts(event_id: Optional[str] = None):
    alerts = list(re.store.ndrf.values())
    if event_id:
        alerts = [a for a in alerts if a.get("event_id") == event_id]
    return {"alerts": alerts, "count": len(alerts)}


# ---------------------------------------------------------------------------
# Resources
# ---------------------------------------------------------------------------

@app.get("/api/v1/resources", tags=["Resources"])
def list_resources():
    return {"resources": DEMO_RESOURCES, "source": "SIMULATED", "count": len(DEMO_RESOURCES)}


@app.get("/api/v1/resources/gap", tags=["Resources"])
def resource_gap(event_id: str):
    ev = re.store.events.get(event_id)
    if not ev:
        raise HTTPException(404)
    imp = re.store.impacts.get(event_id, {}).get(ev.current_tick)
    if not imp:
        return {"gap": [], "event_id": event_id, "tick": ev.current_tick}
    required = max(1, imp.total_exposed_population // 200_000)
    available = sum(1 for r in DEMO_RESOURCES
                    if r["resource_type"] == "NDRF_TEAM" and r["available"])
    shortfall = max(0, required - available)
    return {
        "event_id": event_id, "tick": ev.current_tick,
        "required_ndrf_teams": required,
        "available_ndrf_teams": available,
        "shortfall": shortfall,
        "status": ("CRITICAL" if shortfall > 3
                   else "ADEQUATE" if shortfall == 0
                   else "CONSTRAINED"),
        "source": "SIMULATED",
    }


# ---------------------------------------------------------------------------
# Districts readiness
# ---------------------------------------------------------------------------

_READINESS = {
    "South 24 Parganas": dict(evacuation=45, shelter=60, medical=55, transport=40, overall=50, label="CRITICAL"),
    "Kolkata":            dict(evacuation=70, shelter=75, medical=80, transport=65, overall=72, label="MODERATE"),
    "Howrah":             dict(evacuation=60, shelter=68, medical=72, transport=55, overall=64, label="MODERATE"),
    "East Medinipur":     dict(evacuation=40, shelter=50, medical=45, transport=38, overall=43, label="CRITICAL"),
    "Bhadrak":            dict(evacuation=55, shelter=62, medical=58, transport=50, overall=56, label="MODERATE"),
    "Puri":               dict(evacuation=65, shelter=70, medical=68, transport=60, overall=66, label="MODERATE"),
}


@app.get("/api/v1/districts", tags=["Districts"])
def list_districts():
    return {"districts": [{"district": k, **v} for k, v in _READINESS.items()],
            "source": "SIMULATED"}


@app.get("/api/v1/districts/{district}/readiness", tags=["Districts"])
def district_readiness(district: str):
    r = _READINESS.get(district, dict(evacuation=50, shelter=50, medical=50,
                                      transport=50, overall=50, label="UNKNOWN"))
    return {"district": district, "readiness": r, "source": "SIMULATED",
            "disclaimer": "All readiness values are SIMULATED for demo purposes."}
