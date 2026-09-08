"""
CYCLONE-OS: Demo Seed Data — Cyclone Amphan (CYC-2020-AMPHAN)
12 deterministic replay ticks: T0 (2020-05-14 00Z) → T11 (2020-05-19 12Z)
Each tick = ~12 hours.  All data is SIMULATED for demo purposes.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List


def utc(s: str) -> datetime:
    return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# 12 canonical ticks — lat/lon/intensity/pressure/regime/environment
# ---------------------------------------------------------------------------
AMPHAN_TICKS: List[Dict[str, Any]] = [
    # T0 — 2020-05-14 00Z  Depression formation
    dict(tick=0, ts="2020-05-14T00:00:00", lat=10.5, lon=86.5,
         wind=30, pres=1004, spd=12, hdg=335, regime="FORMATION",
         sst=29.8, shear=12, humidity=72,
         eye_km=None, symm=None, burst=False,
         cpd=False, conf=0.72,
         regime_probs={"FORMATION":0.80,"DEVELOPING":0.18,"INTENSIFYING":0.02}),
    # T1 — 2020-05-14 12Z  Developing
    dict(tick=1, ts="2020-05-14T12:00:00", lat=11.2, lon=86.3,
         wind=45, pres=998, spd=14, hdg=340, regime="DEVELOPING",
         sst=30.1, shear=10, humidity=75,
         eye_km=None, symm=0.4, burst=False,
         cpd=False, conf=0.76,
         regime_probs={"DEVELOPING":0.72,"INTENSIFYING":0.22,"FORMATION":0.06}),
    # T2 — 2020-05-15 00Z  Intensifying
    dict(tick=2, ts="2020-05-15T00:00:00", lat=12.1, lon=86.0,
         wind=65, pres=988, spd=16, hdg=345, regime="INTENSIFYING",
         sst=30.4, shear=8, humidity=78,
         eye_km=40, symm=0.6, burst=False,
         cpd=False, conf=0.80,
         regime_probs={"INTENSIFYING":0.68,"RAPID_INTENSIFICATION":0.24,"DEVELOPING":0.08}),
    # T3 — 2020-05-15 12Z  CHANGE POINT → Rapid Intensification
    dict(tick=3, ts="2020-05-15T12:00:00", lat=13.0, lon=85.8,
         wind=95, pres=970, spd=18, hdg=350, regime="RAPID_INTENSIFICATION",
         sst=30.6, shear=5, humidity=82,
         eye_km=35, symm=0.75, burst=True,
         cpd=True, conf=0.88,
         regime_probs={"RAPID_INTENSIFICATION":0.78,"INTENSIFYING":0.18,"MATURE":0.04}),
    # T4 — 2020-05-16 00Z  Peak RI
    dict(tick=4, ts="2020-05-16T00:00:00", lat=13.8, lon=85.5,
         wind=120, pres=952, spd=20, hdg=355, regime="RAPID_INTENSIFICATION",
         sst=30.8, shear=4, humidity=84,
         eye_km=30, symm=0.85, burst=True,
         cpd=False, conf=0.91,
         regime_probs={"RAPID_INTENSIFICATION":0.65,"MATURE":0.30,"INTENSIFYING":0.05}),
    # T5 — 2020-05-16 12Z  Mature / Peak intensity
    dict(tick=5, ts="2020-05-16T12:00:00", lat=14.8, lon=85.2,
         wind=155, pres=920, spd=22, hdg=358, regime="MATURE",
         sst=30.5, shear=6, humidity=80,
         eye_km=25, symm=0.92, burst=True,
         cpd=False, conf=0.93,
         regime_probs={"MATURE":0.80,"RAPID_INTENSIFICATION":0.12,"WEAKENING":0.08}),
    # T6 — 2020-05-17 00Z  Still mature
    dict(tick=6, ts="2020-05-17T00:00:00", lat=16.0, lon=85.0,
         wind=150, pres=925, spd=24, hdg=2, regime="MATURE",
         sst=30.2, shear=8, humidity=78,
         eye_km=28, symm=0.88, burst=False,
         cpd=False, conf=0.90,
         regime_probs={"MATURE":0.75,"WEAKENING":0.20,"RAPID_INTENSIFICATION":0.05}),
    # T7 — 2020-05-17 12Z  Weakening begins
    dict(tick=7, ts="2020-05-17T12:00:00", lat=17.5, lon=85.0,
         wind=135, pres=935, spd=26, hdg=5, regime="WEAKENING",
         sst=29.8, shear=11, humidity=76,
         eye_km=32, symm=0.80, burst=False,
         cpd=False, conf=0.87,
         regime_probs={"WEAKENING":0.70,"MATURE":0.25,"DISSIPATING":0.05}),
    # T8 — 2020-05-18 00Z  Approaching landfall
    dict(tick=8, ts="2020-05-18T00:00:00", lat=19.0, lon=85.2,
         wind=120, pres=947, spd=28, hdg=10, regime="WEAKENING",
         sst=29.4, shear=14, humidity=74,
         eye_km=38, symm=0.70, burst=False,
         cpd=False, conf=0.85,
         regime_probs={"WEAKENING":0.78,"DISSIPATING":0.15,"MATURE":0.07}),
    # T9 — 2020-05-18 12Z  Landfall (Sundarbans ~20.5N 88.0E)
    dict(tick=9, ts="2020-05-18T12:00:00", lat=20.5, lon=86.8,
         wind=155, pres=920, spd=30, hdg=18, regime="MATURE",
         sst=28.8, shear=10, humidity=88,
         eye_km=25, symm=0.90, burst=True,
         cpd=True, conf=0.95,
         regime_probs={"MATURE":0.85,"WEAKENING":0.12,"RAPID_INTENSIFICATION":0.03}),
    # T10 — 2020-05-19 00Z  Post-landfall weakening
    dict(tick=10, ts="2020-05-19T00:00:00", lat=22.0, lon=87.5,
         wind=90, pres=960, spd=25, hdg=20, regime="WEAKENING",
         sst=None, shear=18, humidity=70,
         eye_km=45, symm=0.55, burst=False,
         cpd=False, conf=0.80,
         regime_probs={"WEAKENING":0.82,"DISSIPATING":0.15,"MATURE":0.03}),
    # T11 — 2020-05-19 12Z  Dissipating
    dict(tick=11, ts="2020-05-19T12:00:00", lat=23.5, lon=88.2,
         wind=45, pres=988, spd=18, hdg=25, regime="DISSIPATING",
         sst=None, shear=22, humidity=65,
         eye_km=None, symm=0.30, burst=False,
         cpd=False, conf=0.75,
         regime_probs={"DISSIPATING":0.88,"WEAKENING":0.12}),
]

AMPHAN_EVENT_ID = "CYC-2020-AMPHAN"
AMPHAN_START = utc("2020-05-14T00:00:00")

# Outcome (actual historical result — approximate)
AMPHAN_OUTCOME = {
    "event_id": AMPHAN_EVENT_ID,
    "final_lat": 23.5,
    "final_lon": 88.2,
    "final_intensity_kt": 45.0,
    "final_pressure_hpa": 988.0,
    "landfall_lat": 21.65,
    "landfall_lon": 88.35,
    "landfall_time": "2020-05-20T09:30:00Z",
    "summary": "Super Cyclonic Storm Amphan made landfall near the Sundarbans on 20 May 2020 with winds ~155 kt (peak). One of the strongest Bay of Bengal storms on record. All data SIMULATED for demo."
}

# Forecast members per tick (static, precomputed)
FORECAST_MODELS = ["GFS", "ECMWF", "IMD", "UKMET"]

# ---------------------------------------------------------------------------
# Demo NDRF resources (pre-seeded)
# ---------------------------------------------------------------------------
DEMO_RESOURCES = [
    {"id": "RES-001", "name": "NDRF 2nd Battalion", "resource_type": "NDRF_TEAM",
     "district": "Kolkata", "lat": 22.57, "lon": 88.36, "capacity": 150, "available": True, "status": "STANDBY"},
    {"id": "RES-002", "name": "NDRF 8th Battalion", "resource_type": "NDRF_TEAM",
     "district": "Bhubaneswar", "lat": 20.29, "lon": 85.82, "capacity": 150, "available": True, "status": "STANDBY"},
    {"id": "RES-003", "name": "NDRF 12th Battalion", "resource_type": "NDRF_TEAM",
     "district": "Guwahati", "lat": 26.18, "lon": 91.73, "capacity": 150, "available": False, "status": "DEPLOYED"},
    {"id": "RES-004", "name": "Emergency Shelter A", "resource_type": "SHELTER",
     "district": "South 24 Parganas", "lat": 22.0, "lon": 88.3, "capacity": 5000, "available": True, "status": "READY"},
    {"id": "RES-005", "name": "Medical Hub Kolkata", "resource_type": "MEDICAL",
     "district": "Kolkata", "lat": 22.55, "lon": 88.33, "capacity": 200, "available": True, "status": "READY"},
    {"id": "RES-006", "name": "Coast Guard Station Paradip", "resource_type": "COAST_GUARD",
     "district": "Jagatsinghpur", "lat": 20.31, "lon": 86.61, "capacity": 40, "available": True, "status": "ALERT"},
    {"id": "RES-007", "name": "Cyclone Shelter Digha", "resource_type": "SHELTER",
     "district": "East Medinipur", "lat": 21.62, "lon": 87.51, "capacity": 3000, "available": True, "status": "READY"},
    {"id": "RES-008", "name": "Transport Fleet WB", "resource_type": "TRANSPORT",
     "district": "Howrah", "lat": 22.58, "lon": 88.30, "capacity": 80, "available": True, "status": "STANDBY"},
]
