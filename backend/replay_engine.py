"""
CYCLONE-OS: replay_engine.py
The ONE event clock.  This is the only module allowed to mutate current_tick.
Members 3 and 4 read tick from the event; they never advance it.
Member 2 — Backend / Event / State Architect
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

import alert_engine
import timeline as tl
<<<<<<< HEAD
from schemas import (
    Alert, AlertLevel, AuditRecord, ChangePoint, CycloneEvent,
=======
import providers
import rras_engine
from backend.ml.intelligence_service import IntelligenceService
from schemas import (
    Alert, AlertLevel, AuditRecord, Basin, ChangePoint, CycloneEvent,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    CycloneState, DataFreshness, Environment, EventStatus,
    ExposureBreakdown, Forecast, ForecastMember, ForecastTrackPoint,
    GeoPoint, Hazard, HazardThreshold, HazardZone, ImpactAssessment,
    ObservationQuality, OperationalTask, Regime, RiskLevel,
    Scenario, ScenarioType, Structure, TaskPriority, TaskStatus,
    TimelineEventType, Outcome,
)
from seed_data import AMPHAN_TICKS, AMPHAN_EVENT_ID, AMPHAN_OUTCOME


def _utc(s: str) -> datetime:
<<<<<<< HEAD
    return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)
=======
    return datetime.fromisoformat(s.replace("Z", "+00:00")).replace(tzinfo=timezone.utc)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


# ---------------------------------------------------------------------------
# Central in-memory Store  (single-process, hackathon-grade)
# ---------------------------------------------------------------------------

class Store:
    """One store instance. All domain data lives here keyed by event_id."""
    def __init__(self):
        self.events:    Dict[str, CycloneEvent] = {}
        self.states:    Dict[str, Dict[int, CycloneState]] = {}
<<<<<<< HEAD
=======
        self.snapshots: Dict[str, Dict[int, Any]] = {}
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        self.forecasts: Dict[str, Dict[int, Forecast]] = {}
        self.scenarios: Dict[str, Dict[int, List[Scenario]]] = {}
        self.hazards:   Dict[str, Dict[int, Hazard]] = {}
        self.impacts:   Dict[str, Dict[int, ImpactAssessment]] = {}
        self.alerts:    Dict[str, Dict[int, Alert]] = {}
        self.tasks:     Dict[str, Dict[int, List[OperationalTask]]] = {}
<<<<<<< HEAD
=======
        self.rras:      Dict[str, Dict[int, Any]] = {}   # NEW — RRAS outputs
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        self.outcomes:  Dict[str, Outcome] = {}
        self.sos:       Dict[str, Any] = {}
        self.ndrf:      Dict[str, Any] = {}


store = Store()


# ---------------------------------------------------------------------------
# Haversine
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(max(0.0, min(1.0, a))))


# ---------------------------------------------------------------------------
# Hazard generator  (parametric Holland-style)
# ---------------------------------------------------------------------------

def _wind_radius_km(intensity_kt: float, threshold_kt: float) -> Optional[float]:
    if intensity_kt < threshold_kt:
        return None
    ratios = {34: 2.8, 50: 1.6, 64: 0.9}
    return max(30.0, intensity_kt * ratios.get(threshold_kt, 1.0))


def _circle_geojson(lat: float, lon: float, radius_km: float, n: int = 64) -> Dict[str, Any]:
    coords = []
    for i in range(n + 1):
        angle = math.radians(360 * i / n)
        dlat = radius_km / 111.32
        dlon = radius_km / (111.32 * math.cos(math.radians(lat)))
        coords.append([lon + dlon * math.sin(angle), lat + dlat * math.cos(angle)])
    return {
        "type": "FeatureCollection",
        "features": [{"type": "Feature",
                       "geometry": {"type": "Polygon", "coordinates": [coords]},
                       "properties": {}}],
    }


def generate_hazard(event_id: str, tick: int, state: CycloneState,
                    scenario_type: ScenarioType = ScenarioType.BASE) -> Hazard:
    lat, lon = state.lat, state.lon
    intensity = state.intensity_kt
    perturb = {"BASE": 0, "LEFT": -1.5, "RIGHT": 1.5,
                "RAPID_INTENSIFICATION": 0, "TRACK_NORTH": 0, "TRACK_SOUTH": 0}
    lon += perturb.get(scenario_type.value, 0)

    zones = []
    for ht, kt, color in [
        (HazardThreshold.KT_34, 34, "#FFF176"),
        (HazardThreshold.KT_50, 50, "#FF9800"),
        (HazardThreshold.KT_64, 64, "#F44336"),
    ]:
        r = _wind_radius_km(intensity, kt)
        if r:
            zones.append(HazardZone(
                threshold=ht,
                geojson=_circle_geojson(lat, lon, r),
                area_km2=round(math.pi * r ** 2, 1),
                color=color,
            ))

    return Hazard(
        event_id=event_id, tick=tick, scenario_type=scenario_type,
<<<<<<< HEAD
        zones=zones, generated_at=_utc_now(),
=======
        zones=zones, generated_at=state.timestamp,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        source="PARAMETRIC_HOLLAND_SIMPLIFIED",
    )


# ---------------------------------------------------------------------------
# Exposure / Impact  (O(1) precomputed lookup)
# ---------------------------------------------------------------------------

_EXPOSURE: Dict[int, Dict[str, Any]] = {
    0:  dict(pop=0,         districts=[],                                              tti=None, risk=0.05, flood=0.0,  rl="LOW"),
    1:  dict(pop=0,         districts=[],                                              tti=None, risk=0.08, flood=0.0,  rl="LOW"),
    2:  dict(pop=50_000,    districts=["Puri"],                                        tti=96.0, risk=0.15, flood=0.05, rl="LOW"),
    3:  dict(pop=200_000,   districts=["Puri","Khordha"],                              tti=84.0, risk=0.30, flood=0.10, rl="MODERATE"),
    4:  dict(pop=500_000,   districts=["Puri","Khordha","Jagatsinghpur"],              tti=72.0, risk=0.48, flood=0.18, rl="MODERATE"),
    5:  dict(pop=1_200_000, districts=["Jagatsinghpur","Kendrapara","Bhadrak"],        tti=60.0, risk=0.62, flood=0.28, rl="HIGH"),
    6:  dict(pop=1_800_000, districts=["Bhadrak","Balasore","East Medinipur"],         tti=48.0, risk=0.70, flood=0.35, rl="HIGH"),
    7:  dict(pop=2_400_000, districts=["East Medinipur","24 Parganas North","South 24 Parganas"], tti=36.0, risk=0.80, flood=0.45, rl="HIGH"),
    8:  dict(pop=3_000_000, districts=["South 24 Parganas","Kolkata","Howrah"],        tti=24.0, risk=0.88, flood=0.55, rl="EXTREME"),
    9:  dict(pop=3_400_000, districts=["South 24 Parganas","Kolkata","Howrah","Hooghly"], tti=12.0, risk=0.95, flood=0.70, rl="EXTREME"),
    10: dict(pop=2_800_000, districts=["Kolkata","Howrah","Hooghly","Nadia"],          tti=2.0,  risk=0.92, flood=0.65, rl="EXTREME"),
    11: dict(pop=1_500_000, districts=["Nadia","Murshidabad"],                         tti=0.0,  risk=0.60, flood=0.40, rl="HIGH"),
}
_LANDFALL = GeoPoint(lat=21.65, lon=88.35)


def generate_impact(event_id: str, tick: int, state: CycloneState,
                    scenario_type: ScenarioType = ScenarioType.BASE) -> ImpactAssessment:
    d = _EXPOSURE.get(tick, _EXPOSURE[0])
    pop, tti, risk, flood = d["pop"], d["tti"], d["risk"], d["flood"]
    rl, districts = RiskLevel(d["rl"]), list(d["districts"])

    if scenario_type == ScenarioType.LEFT:
        pop = int(pop * 0.7); tti = (tti + 6) if tti else None
    elif scenario_type == ScenarioType.RIGHT:
        pop = int(pop * 1.35); tti = (max(0, tti - 6)) if tti else None

    risk_factors: List[str] = []
    if state.intensity_kt >= 64:
        risk_factors.append(f"Category-4+ winds ({state.intensity_kt:.0f} kt)")
    if state.intensity_kt >= 100:
        risk_factors.append("Extreme storm surge risk")
    if tti is not None and tti <= 48:
        risk_factors.append(f"Time-to-impact: {tti:.0f}h")
    if pop > 1_000_000:
        risk_factors.append(f"{pop/1_000_000:.1f}M population in hazard zone")
    if flood > 0.3:
        risk_factors.append("Elevated flood risk index")
    if state.environment and state.environment.sst_c and state.environment.sst_c > 30:
        risk_factors.append(f"Warm SST ({state.environment.sst_c}°C)")

    breakdown: List[ExposureBreakdown] = []
    if state.intensity_kt >= 34:
        breakdown.append(ExposureBreakdown(threshold=HazardThreshold.KT_34, population_exposed=pop, districts=districts))
    if state.intensity_kt >= 50:
        breakdown.append(ExposureBreakdown(threshold=HazardThreshold.KT_50, population_exposed=int(pop*0.55), districts=districts[:2]))
    if state.intensity_kt >= 64:
        breakdown.append(ExposureBreakdown(threshold=HazardThreshold.KT_64, population_exposed=int(pop*0.25), districts=districts[:1]))

    return ImpactAssessment(
        event_id=event_id, tick=tick, scenario_type=scenario_type,
        total_exposed_population=pop, exposure_breakdown=breakdown,
        affected_districts=districts, time_to_impact_hours=tti,
        nearest_impact_point=_LANDFALL if tti is not None else None,
        risk_level=rl, risk_factors=risk_factors,
        flood_risk_index=round(flood, 3), composite_risk=round(risk, 3),
        source="SIMULATED_PRECOMPUTED",
    )


# ---------------------------------------------------------------------------
# Forecast generator
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def generate_forecast(event_id: str, tick: int, state: CycloneState) -> Forecast:
    forecast_id = str(uuid4())
=======
def generate_forecast(event_id: str, tick: int, state: CycloneState,
                      snap: Optional[Any] = None) -> Forecast:
    forecast_id = f"FC-{event_id}-T{tick}"

    # Handle T11 (dissipation / past forecast horizon)
    if tick >= len(AMPHAN_TICKS) - 1:
        return Forecast(
            id=forecast_id,
            event_id=event_id,
            tick=tick,
            init_time=state.timestamp,
            members=[],
            consensus_track=[],
            model_disagreement_score=0.0,
            source="SIMULATED",
        )

>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    model_offsets = {"GFS": (0.0, 0.0, -5), "ECMWF": (-0.3, 0.2, 3),
                     "IMD": (0.2, -0.3, -8), "UKMET": (0.1, 0.1, 2)}
    members: List[ForecastMember] = []

    for model, (dlat, dlon, dwind) in model_offsets.items():
        track_pts = []
        for lead in [6, 12, 24, 48]:
<<<<<<< HEAD
            idx = min(tick + lead // 12, 11)
            ref = AMPHAN_TICKS[idx]
=======
            lead_tick = tick + lead // 12
            if lead_tick >= len(AMPHAN_TICKS):
                continue
            ref = AMPHAN_TICKS[lead_tick]
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
            track_pts.append(ForecastTrackPoint(
                lead_hours=lead,
                lat=round(ref["lat"] + dlat, 2), lon=round(ref["lon"] + dlon, 2),
                intensity_kt=max(25.0, ref["wind"] + dwind),
                pressure_hpa=ref["pres"] - dwind * 0.3,
            ))
<<<<<<< HEAD
        members.append(ForecastMember(
            forecast_version_id=forecast_id, model_name=model,
            init_time=state.timestamp, track_points=track_pts, source="SIMULATED",
        ))
=======
        if track_pts:
            members.append(ForecastMember(
                id=f"MEM-{forecast_id}-{model}",
                forecast_version_id=forecast_id, model_name=model,
                init_time=state.timestamp, track_points=track_pts, source="SIMULATED",
            ))
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

    consensus: List[ForecastTrackPoint] = []
    for lead in [6, 12, 24, 48]:
        pts = [p for m in members for p in m.track_points if p.lead_hours == lead]
        if pts:
            consensus.append(ForecastTrackPoint(
                lead_hours=lead,
                lat=round(sum(p.lat for p in pts) / len(pts), 2),
                lon=round(sum(p.lon for p in pts) / len(pts), 2),
                intensity_kt=round(sum(p.intensity_kt for p in pts) / len(pts), 1),
                pressure_hpa=round(sum(p.pressure_hpa for p in pts) / len(pts), 1),
            ))

    lats_24 = [m.track_points[2].lat for m in members if len(m.track_points) > 2]
    disagreement = round((max(lats_24) - min(lats_24)) / 4.0, 3) if lats_24 else 0.0

    return Forecast(
        id=forecast_id, event_id=event_id, tick=tick,
        init_time=state.timestamp, members=members,
        consensus_track=consensus, model_disagreement_score=disagreement,
        source="SIMULATED",
    )


# ---------------------------------------------------------------------------
# Scenario generator
# ---------------------------------------------------------------------------

def generate_scenarios(event_id: str, tick: int, state: CycloneState,
<<<<<<< HEAD
                       forecast: Forecast) -> List[Scenario]:
    probs: Dict[ScenarioType, float] = {
        ScenarioType.BASE: 0.65, ScenarioType.LEFT: 0.20, ScenarioType.RIGHT: 0.15,
    }
    if state.regime == Regime.RAPID_INTENSIFICATION:
        probs[ScenarioType.RAPID_INTENSIFICATION] = 0.15
        total = sum(probs.values())
        probs = {k: v / total for k, v in probs.items()}
=======
                       forecast: Forecast,
                       snap: Optional[Any] = None) -> List[Scenario]:
    if snap and hasattr(snap, "scenarios") and hasattr(snap.scenarios, "scenarios") and snap.scenarios.scenarios:
        raw_probs = [s.probability for s in snap.scenarios.scenarios]
        total = sum(raw_probs)
        norm_probs = [p / total for p in raw_probs] if total > 0 else [0.65, 0.20, 0.15]
        probs = {
            ScenarioType.BASE: norm_probs[0],
            ScenarioType.LEFT: norm_probs[1] if len(norm_probs) > 1 else 0.20,
            ScenarioType.RIGHT: norm_probs[2] if len(norm_probs) > 2 else 0.15,
        }
    else:
        probs = {
            ScenarioType.BASE: 0.65, ScenarioType.LEFT: 0.20, ScenarioType.RIGHT: 0.15,
        }
        if state.regime == Regime.RAPID_INTENSIFICATION:
            probs[ScenarioType.RAPID_INTENSIFICATION] = 0.15
            total = sum(probs.values())
            probs = {k: v / total for k, v in probs.items()}

    # Guarantee probabilities sum to 1.0
    tot = sum(probs.values())
    probs = {k: v / tot for k, v in probs.items()}
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

    lat_off = {"BASE": 0.0, "LEFT": -1.5, "RIGHT": 1.5, "RAPID_INTENSIFICATION": 0.0}
    wind_mult = {"BASE": 1.0, "LEFT": 0.9, "RIGHT": 1.1, "RAPID_INTENSIFICATION": 1.15}

    scenarios: List[Scenario] = []
    for st, prob in probs.items():
        lo = lat_off.get(st.value, 0.0)
        wm = wind_mult.get(st.value, 1.0)
<<<<<<< HEAD
        track = [ForecastTrackPoint(
            lead_hours=p.lead_hours,
            lat=round(p.lat, 2), lon=round(p.lon + lo * 0.5, 2),
            intensity_kt=round(p.intensity_kt * wm, 1), pressure_hpa=round(p.pressure_hpa, 1),
        ) for p in forecast.consensus_track]
        peak = max((p.intensity_kt for p in track), default=state.intensity_kt)
        peak_p = min((p.pressure_hpa for p in track), default=state.pressure_hpa)
        scenarios.append(Scenario(
            event_id=event_id, tick=tick, scenario_type=st,
            probability=round(prob, 3), track=track,
            peak_intensity_kt=round(peak, 1), peak_pressure_hpa=round(peak_p, 1),
            landfall_lat=round(_LANDFALL.lat + lo * 0.3, 2),
            landfall_lon=round(_LANDFALL.lon + lo * 0.5, 2),
            time_to_impact_hours=_EXPOSURE.get(tick, {}).get("tti"),
=======
        if forecast.consensus_track:
            track = [ForecastTrackPoint(
                lead_hours=p.lead_hours,
                lat=round(p.lat, 2), lon=round(p.lon + lo * 0.5, 2),
                intensity_kt=round(p.intensity_kt * wm, 1), pressure_hpa=round(p.pressure_hpa, 1),
            ) for p in forecast.consensus_track]
            peak = max((p.intensity_kt for p in track), default=state.intensity_kt)
            peak_p = min((p.pressure_hpa for p in track), default=state.pressure_hpa)
        else:
            track = [ForecastTrackPoint(
                lead_hours=0,
                lat=round(state.lat, 2),
                lon=round(state.lon, 2),
                intensity_kt=round(state.intensity_kt, 1),
                pressure_hpa=round(state.pressure_hpa, 1),
            )]
            peak = state.intensity_kt
            peak_p = state.pressure_hpa

        scenarios.append(Scenario(
            event_id=event_id, tick=tick, scenario_type=st,
            probability=round(prob, 4), track=track,
            peak_intensity_kt=round(peak, 1), peak_pressure_hpa=round(peak_p, 1),
            landfall_lat=round(_LANDFALL.lat + lo * 0.3, 2),
            landfall_lon=round(_LANDFALL.lon + lo * 0.5, 2),
            time_to_impact_hours=_EXPOSURE.get(tick, {}).get("tti", 0.0) if tick < 11 else 0.0,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
            source="SIMULATED",
            rationale=f"{st.value}: {'consensus' if st == ScenarioType.BASE else 'lateral perturbation'}",
        ))
    return scenarios


# ---------------------------------------------------------------------------
# Operations task generator
# ---------------------------------------------------------------------------

def generate_tasks(event_id: str, tick: int, state: CycloneState,
                   alert: Alert, impact: ImpactAssessment) -> List[OperationalTask]:
    tasks: List[OperationalTask] = []

    def _task(title: str, desc: str, priority: TaskPriority,
               role: str, trigger: str, district: Optional[str] = None) -> OperationalTask:
        return OperationalTask(
<<<<<<< HEAD
=======
            id=f"TASK-{event_id}-T{tick}-{len(tasks) + 1}",
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
            event_id=event_id, tick=tick, title=title, description=desc,
            priority=priority, status=TaskStatus.ACTIVE, assigned_role=role,
            trigger=trigger, district=district, activated_at=state.timestamp,
        )

    tti = impact.time_to_impact_hours
    if state.regime == Regime.RAPID_INTENSIFICATION:
        tasks.append(_task("Activate Maritime Monitoring",
                           "Deploy maritime patrol assets for RI storm tracking.",
                           TaskPriority.HIGH, "COAST_GUARD", "RAPID_INTENSIFICATION detected"))
    if tti is not None and tti <= 72:
        tasks.append(_task("Initiate Coastal Evacuation Warning",
                           f"Issue pre-evacuation advisory: {', '.join(impact.affected_districts[:3])}.",
                           TaskPriority.HIGH, "DISTRICT_ADMIN", f"TTI={tti:.0f}h",
                           impact.affected_districts[0] if impact.affected_districts else None))
    if tti is not None and tti <= 48 and impact.total_exposed_population > 500_000:
        tasks.append(_task("Pre-Position NDRF Teams",
                           f"Move NDRF battalions to {', '.join(impact.affected_districts[:2])}.",
                           TaskPriority.CRITICAL, "NDRF_COMMAND",
                           f"exposure={impact.total_exposed_population:,}, TTI={tti:.0f}h",
                           impact.affected_districts[0] if impact.affected_districts else None))
    if alert.level == AlertLevel.RED:
        tasks.append(_task("Execute Mandatory Evacuation",
                           "Mandatory evacuation order for all RED-zone coastal districts.",
                           TaskPriority.CRITICAL, "STATE_EOC", "Alert=RED"))
        n_shelters = max(10, impact.total_exposed_population // 50_000)
        tasks.append(_task("Activate Emergency Shelters",
                           f"Open {n_shelters} shelter facilities.",
                           TaskPriority.CRITICAL, "DISTRICT_ADMIN", "Alert=RED"))
    if alert.level in (AlertLevel.ORANGE, AlertLevel.RED):
        tasks.append(_task("Deploy Medical Response Teams",
                           "Pre-position trauma and medical units in high-risk districts.",
                           TaskPriority.HIGH, "HEALTH_DEPT", f"Alert={alert.level.value}"))
    return tasks


# ---------------------------------------------------------------------------
# Build CycloneState from seed tick dict
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def _build_state(event_id: str, td: Dict[str, Any]) -> CycloneState:
    tick = td["tick"]
=======
# ---------------------------------------------------------------------------
# Build CycloneState from seed tick dict and Member 3 IntelligenceSnapshot
# ---------------------------------------------------------------------------

def _build_state(event_id: str, td: Dict[str, Any], snap: Optional[Any] = None) -> CycloneState:
    tick = td["tick"]
    if snap is None:
        try:
            svc = IntelligenceService()
            snap = svc.get_snapshot(event_id, tick)
        except Exception:
            snap = None

    if snap is not None:
        ts = snap.timestamp
        lat = snap.center.lat
        lon = snap.center.lon
        wind = float(snap.intensity.value_kt)
        pres = float(snap.intensity.min_pressure_hpa)
        uncert = float(round((snap.intensity.upper_bound_kt - snap.intensity.lower_bound_kt) / 2.0, 1))

        env = Environment(
            sst_c=float(snap.environment.sst_c),
            shear_kt=float(snap.environment.wind_shear_kt),
            humidity_pct=float(snap.environment.mid_level_humidity_pct),
            divergence=float(snap.environment.upper_divergence),
        )
        struct = Structure(
            eye_diameter_km=float(snap.structure.rmw_km) if snap.structure.eye_probability > 0.4 else None,
            eyewall_symmetry=float(snap.structure.symmetry),
            convective_burst=(snap.structure.convective_organization > 0.7),
        )

        if snap.change_point and snap.change_point.detected:
            prev_r_val = snap.change_point.previous_regime.value if hasattr(snap.change_point.previous_regime, "value") else str(snap.change_point.previous_regime) if snap.change_point.previous_regime else None
            new_r_val = snap.change_point.new_regime.value if hasattr(snap.change_point.new_regime, "value") else str(snap.change_point.new_regime) if snap.change_point.new_regime else None
            prev_r = Regime(prev_r_val) if prev_r_val else None
            new_r = Regime(new_r_val) if new_r_val else None
            cpd = ChangePoint(
                detected=True,
                timestamp=ts,
                from_regime=prev_r,
                to_regime=new_r,
                confidence=float(snap.change_point.confidence or 0.88),
                description=f"Change point detected at T{tick}: {prev_r.value if prev_r else ''} -> {new_r.value if new_r else ''}",
            )
        else:
            cpd = ChangePoint(detected=False, timestamp=ts)

        regime_val = snap.regime.dominant_regime.value if hasattr(snap.regime.dominant_regime, "value") else str(snap.regime.dominant_regime)
        try:
            regime = Regime(regime_val)
        except ValueError:
            regime = Regime.DEVELOPING

        conf = float(round(1.0 - snap.uncertainty.overall_uncertainty, 3))
        is_good = snap.uncertainty.data_quality_flag == "GOOD"
        obs_quality = ObservationQuality(
            score=conf,
            sources=["IBTrACS", "INSAT-3DR"] if is_good else ["IBTrACS"],
            freshness=DataFreshness.FRESH if is_good else DataFreshness.AGING,
        )

        return CycloneState(
            id=f"STATE-{event_id}-T{tick}",
            event_id=event_id,
            tick=tick,
            timestamp=ts,
            lat=lat,
            lon=lon,
            intensity_kt=wind,
            pressure_hpa=pres,
            intensity_uncertainty_kt=uncert,
            movement_speed_kmh=float(td.get("spd", 12.0 + tick * 1.5)),
            movement_heading_deg=float(td.get("hdg", 335.0 + tick * 2.5)),
            structure=struct,
            regime=regime,
            regime_probabilities=snap.regime.probabilities,
            environment=env,
            confidence=conf,
            observation_quality=obs_quality,
            change_point=cpd,
        )

    # Fallback to td if snapshot not available
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    ts = _utc(td["ts"])
    env = Environment(sst_c=td.get("sst"), shear_kt=td.get("shear"), humidity_pct=td.get("humidity"))
    struct = Structure(eye_diameter_km=td.get("eye_km"), eyewall_symmetry=td.get("symm"),
                       convective_burst=td.get("burst", False))
    cpd = ChangePoint(detected=False)
    if td.get("cpd") and tick > 0:
        prev = AMPHAN_TICKS[tick - 1]
        cpd = ChangePoint(
            detected=True, timestamp=ts,
            from_regime=Regime(prev["regime"]), to_regime=Regime(td["regime"]),
            delta_wind_kt=td["wind"] - prev["wind"],
            delta_pressure_hpa=td["pres"] - prev["pres"],
            confidence=td.get("conf", 0.8),
            description=(f"Regime shift {prev['regime']} → {td['regime']}: "
                         f"Δwind={td['wind']-prev['wind']:+.0f}kt, "
                         f"ΔP={td['pres']-prev['pres']:+.0f}hPa"),
        )
    return CycloneState(
<<<<<<< HEAD
=======
        id=f"STATE-{event_id}-T{tick}",
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        event_id=event_id, tick=tick, timestamp=ts,
        lat=td["lat"], lon=td["lon"],
        intensity_kt=float(td["wind"]), pressure_hpa=float(td["pres"]),
        intensity_uncertainty_kt=5.0 + (1.0 - td.get("conf", 0.8)) * 20,
        movement_speed_kmh=td.get("spd", 0.0), movement_heading_deg=td.get("hdg", 0.0),
        structure=struct, regime=Regime(td["regime"]),
        regime_probabilities=td.get("regime_probs", {}),
        environment=env, confidence=td.get("conf", 0.8),
        observation_quality=ObservationQuality(
            score=td.get("conf", 0.8), sources=["IBTrACS", "INSAT-3DR"],
            freshness=DataFreshness.FRESH),
        change_point=cpd,
    )


# ---------------------------------------------------------------------------
<<<<<<< HEAD
# Seed Amphan  (idempotent)
# ---------------------------------------------------------------------------

def seed_amphan() -> CycloneEvent:
    eid = AMPHAN_EVENT_ID
    if eid in store.events:
        return store.events[eid]

    for d in [store.states, store.forecasts, store.scenarios,
              store.hazards, store.impacts, store.alerts, store.tasks]:
        d[eid] = {}

    tl.init_event(eid)
    t0 = AMPHAN_TICKS[0]
    t0_state = _build_state(eid, t0)
    store.states[eid][0] = t0_state

    event = CycloneEvent(
        id=eid, name="Amphan", status=EventStatus.ACTIVE, basin="BOB",
        start_time=_utc(t0["ts"]), current_time=_utc(t0["ts"]),
=======
# Seed Amphan  (idempotent, seeds DEMO-001 and CYC-2020-AMPHAN)
# ---------------------------------------------------------------------------

def _seed_single_event(eid: str) -> CycloneEvent:
    if eid in store.events:
        return store.events[eid]

    for d in [store.states, store.snapshots, store.forecasts, store.scenarios,
              store.hazards, store.impacts, store.alerts, store.tasks, store.rras]:
        d[eid] = {}

    tl.init_event(eid)
    svc = IntelligenceService()
    t0_snap = svc.get_snapshot(eid, 0)
    store.snapshots[eid][0] = t0_snap
    t0 = AMPHAN_TICKS[0]
    t0_state = _build_state(eid, t0, t0_snap)
    store.states[eid][0] = t0_state

    event = CycloneEvent(
        id=eid, name="Amphan", status=EventStatus.ACTIVE, basin=Basin.BOB,
        start_time=t0_state.timestamp, current_time=t0_state.timestamp,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        current_tick=0, max_tick=len(AMPHAN_TICKS) - 1,
        demo_mode=True, current_state_id=t0_state.id,
        current_alert=AlertLevel.GREEN,
        meta={"source": "IBTrACS+SIMULATED", "basin": "Bay of Bengal", "year": 2020},
    )

    # Pre-compute all ticks
    prev_alert_level: Optional[AlertLevel] = None
    for td in AMPHAN_TICKS:
        t = td["tick"]
<<<<<<< HEAD
        st = store.states[eid].get(t) or _build_state(eid, td)
        store.states[eid][t] = st
        fc = generate_forecast(eid, t, st)
        store.forecasts[eid][t] = fc
        sc = generate_scenarios(eid, t, st, fc)
=======
        snap = svc.get_snapshot(eid, t)
        store.snapshots[eid][t] = snap
        st = store.states[eid].get(t) or _build_state(eid, td, snap)
        store.states[eid][t] = st
        fc = generate_forecast(eid, t, st, snap)
        store.forecasts[eid][t] = fc
        sc = generate_scenarios(eid, t, st, fc, snap)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        store.scenarios[eid][t] = sc
        hz = generate_hazard(eid, t, st)
        store.hazards[eid][t] = hz
        imp = generate_impact(eid, t, st)
        store.impacts[eid][t] = imp
        alt = alert_engine.build_alert(eid, t, imp, prev_alert_level)
        store.alerts[eid][t] = alt
        prev_alert_level = alt.level
        store.tasks[eid][t] = generate_tasks(eid, t, st, alt, imp)
<<<<<<< HEAD
=======
        rras_out = rras_engine.build_rras_output(eid, t, imp, hz, alt)
        store.rras[eid][t] = rras_out
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

    # Seed outcome
    o = AMPHAN_OUTCOME
    store.outcomes[eid] = Outcome(
        event_id=eid, final_lat=o["final_lat"], final_lon=o["final_lon"],
        final_intensity_kt=o["final_intensity_kt"], final_pressure_hpa=o["final_pressure_hpa"],
        landfall_lat=o.get("landfall_lat"), landfall_lon=o.get("landfall_lon"),
        landfall_time=_utc(o["landfall_time"]) if o.get("landfall_time") else None,
        summary=o["summary"],
    )

    # Audit records
    for td in AMPHAN_TICKS[:-3]:
        t = td["tick"]
        fc = store.forecasts[eid][t]
        for lead in [6, 12, 24, 48]:
            target_t = min(t + lead // 12, 11)
            actual = AMPHAN_TICKS[target_t]
            cpt = next((p for p in fc.consensus_track if p.lead_hours == lead), None)
            if cpt:
                tl.add_audit(eid, AuditRecord(
                    event_id=eid, prediction_tick=t,
                    prediction_time=_utc(td["ts"]), target_time=_utc(actual["ts"]),
                    lead_hours=lead, model_source="CONSENSUS_SIMULATED",
                    predicted_lat=cpt.lat, predicted_lon=cpt.lon,
                    predicted_intensity_kt=cpt.intensity_kt,
                    actual_lat=actual["lat"], actual_lon=actual["lon"],
                    actual_intensity_kt=float(actual["wind"]),
                    track_error_km=round(haversine_km(cpt.lat, cpt.lon, actual["lat"], actual["lon"]), 2),
                    intensity_error_kt=round(abs(cpt.intensity_kt - actual["wind"]), 2),
                ))

    # Seed timeline (tick 0)
<<<<<<< HEAD
    tl.log_observation(eid, 0, _utc(t0["ts"]),
                       "Initial observation received — Depression forming in Bay of Bengal")
    tl.log_state_update(eid, 0, _utc(t0["ts"]),
                        t0["wind"], t0["pres"], t0["lat"], t0["lon"])
=======
    tl.log_observation(eid, 0, t0_state.timestamp,
                       "Initial observation received — Depression forming in Bay of Bengal")
    tl.log_state_update(eid, 0, t0_state.timestamp,
                        t0_state.intensity_kt, t0_state.pressure_hpa,
                        t0_state.lat, t0_state.lon)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

    store.events[eid] = event
    return event


<<<<<<< HEAD
=======
def seed_amphan(event_id: Optional[str] = None) -> CycloneEvent:
    _seed_single_event("DEMO-001")
    _seed_single_event(AMPHAN_EVENT_ID)
    if event_id:
        _seed_single_event(event_id)
        return store.events[event_id]
    return store.events["DEMO-001"]


# ---------------------------------------------------------------------------
# Canonical Event Response builder
# ---------------------------------------------------------------------------

def get_canonical_state(event_id: str, tick: Optional[int] = None) -> Dict[str, Any]:
    event = store.events.get(event_id)
    if not event:
        if event_id in ("DEMO-001", AMPHAN_EVENT_ID):
            seed_amphan(event_id)
            event = store.events.get(event_id)
        if not event:
            raise ValueError(f"Event {event_id} not found")

    t = tick if tick is not None else event.current_tick

    # 1. Intelligence snapshot from Member 3's service
    svc = IntelligenceService()
    snapshot = svc.get_snapshot(event_id, t)
    store.snapshots.setdefault(event_id, {})[t] = snapshot

    state = store.states.get(event_id, {}).get(t)
    forecast = store.forecasts.get(event_id, {}).get(t)
    scenarios = store.scenarios.get(event_id, {}).get(t, [])
    hazard = store.hazards.get(event_id, {}).get(t)
    impact = store.impacts.get(event_id, {}).get(t)
    alert = store.alerts.get(event_id, {}).get(t)
    tasks = store.tasks.get(event_id, {}).get(t, [])
    rras = store.rras.get(event_id, {}).get(t)
    timeline_entries = tl.get_timeline(event_id, 0)

    # Build RRAS on-demand if not pre-computed (e.g. goto() jump)
    if rras is None and impact and hazard:
        rras = rras_engine.build_rras_output(event_id, t, impact, hazard, alert)
        store.rras.setdefault(event_id, {})[t] = rras

    return {
        "event": event.model_dump(mode="json") if hasattr(event, "model_dump") else event,
        "tick": t,
        "state": state.model_dump(mode="json") if state and hasattr(state, "model_dump") else (state or {}),
        "intelligence": snapshot.model_dump(mode="json") if snapshot and hasattr(snapshot, "model_dump") else (snapshot or {}),
        "forecasts": forecast.model_dump(mode="json") if forecast and hasattr(forecast, "model_dump") else (forecast or {}),
        "scenarios": [s.model_dump(mode="json") if hasattr(s, "model_dump") else s for s in scenarios],
        "hazards": hazard.model_dump(mode="json") if hazard and hasattr(hazard, "model_dump") else (hazard or {}),
        "hazard": hazard.model_dump(mode="json") if hazard and hasattr(hazard, "model_dump") else (hazard or {}),
        "impact": impact.model_dump(mode="json") if impact and hasattr(impact, "model_dump") else (impact or {}),
        "alert": alert.model_dump(mode="json") if alert and hasattr(alert, "model_dump") else (alert or {}),
        "operations": [t_.model_dump(mode="json") if hasattr(t_, "model_dump") else t_ for t_ in tasks],
        "rras": rras or {},
        "timeline": [e.model_dump(mode="json") if hasattr(e, "model_dump") else e for e in timeline_entries],
    }


>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
# ---------------------------------------------------------------------------
# advance()  — THE ONLY function that mutates current_tick
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def advance(event_id: str, steps: int = 1) -> CycloneEvent:
    event = store.events.get(event_id)
    if not event:
        raise ValueError(f"Event {event_id} not found")

    new_tick = min(event.current_tick + steps, event.max_tick)
    if new_tick == event.current_tick:
        return event  # already at end, safe no-op

    old_tick = event.current_tick
    event.current_tick = new_tick

    td = AMPHAN_TICKS[new_tick]
    event.current_time = _utc(td["ts"])
    state = store.states[event_id][new_tick]
    event.current_state_id = state.id

    alert = store.alerts[event_id][new_tick]
    prev_alert = store.alerts[event_id].get(old_tick)
    event.current_alert = alert.level

    # --- Timeline entries (delegated entirely to timeline module) ---
    tl.log_replay_advance(event_id, old_tick, new_tick, state.timestamp)
    tl.log_state_update(event_id, new_tick, state.timestamp,
                        state.intensity_kt, state.pressure_hpa,
                        state.lat, state.lon)

    if state.change_point and state.change_point.detected:
        tl.log_change_point(
            event_id, new_tick, state.timestamp,
            state.change_point.description,
            state.change_point.from_regime.value if state.change_point.from_regime else None,
            state.change_point.to_regime.value if state.change_point.to_regime else None,
        )

    if new_tick > 0:
        prev_state = store.states[event_id].get(new_tick - 1)
        if prev_state and prev_state.regime != state.regime:
            tl.log_regime_change(event_id, new_tick, state.timestamp,
                                 prev_state.regime.value, state.regime.value)

    if prev_alert and alert_engine.has_escalated(alert):
        tl.log_alert_change(event_id, new_tick, state.timestamp,
                            prev_alert.level.value, alert.level.value)

    impact = store.impacts[event_id][new_tick]
    tl.log_impact_update(event_id, new_tick, state.timestamp,
                         impact.total_exposed_population, impact.time_to_impact_hours)

    for task in store.tasks[event_id][new_tick]:
        tl.log_task(event_id, new_tick, state.timestamp,
                    task.id, task.title, task.priority.value)

    tl.log_forecast_update(event_id, new_tick, state.timestamp,
                           store.forecasts[event_id][new_tick].model_disagreement_score)

    return event
=======
def advance(event_id: str, steps: int = 1) -> Dict[str, Any]:
    event = store.events.get(event_id)
    if not event:
        if event_id in ("DEMO-001", AMPHAN_EVENT_ID):
            seed_amphan(event_id)
            event = store.events.get(event_id)
        if not event:
            raise ValueError(f"Event {event_id} not found")

    old_tick = event.current_tick
    new_tick = min(event.current_tick + steps, event.max_tick)

    # 1. Advance the single clock
    event.current_tick = new_tick

    # 2. Obtain IntelligenceSnapshot for that tick using Member 3's service
    try:
        svc = IntelligenceService()
        snapshot = svc.get_snapshot(event_id, new_tick)
        store.snapshots.setdefault(event_id, {})[new_tick] = snapshot
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Intelligence Layer] Failed to obtain intelligence snapshot at tick {new_tick}: {e}") from e

    # 3. Synchronize canonical state
    try:
        td = AMPHAN_TICKS[new_tick]
        state = _build_state(event_id, td, snapshot)
        store.states.setdefault(event_id, {})[new_tick] = state
        event.current_time = snapshot.timestamp
        event.current_state_id = state.id
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: State Layer] Failed to build cyclone state at tick {new_tick}: {e}") from e

    # 4. Obtain forecast/scenario data for that tick
    try:
        forecast = generate_forecast(event_id, new_tick, state, snapshot)
        store.forecasts.setdefault(event_id, {})[new_tick] = forecast
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Forecast Layer] Failed to generate forecast at tick {new_tick}: {e}") from e

    try:
        scenarios = generate_scenarios(event_id, new_tick, state, forecast, snapshot)
        store.scenarios.setdefault(event_id, {})[new_tick] = scenarios
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Scenario Layer] Failed to generate scenarios at tick {new_tick}: {e}") from e

    # 5. Generate/update hazard and impact
    try:
        hazard = generate_hazard(event_id, new_tick, state)
        store.hazards.setdefault(event_id, {})[new_tick] = hazard
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Hazard Layer] Failed to generate hazard footprint at tick {new_tick}: {e}") from e

    try:
        impact = generate_impact(event_id, new_tick, state)
        store.impacts.setdefault(event_id, {})[new_tick] = impact
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Impact Layer] Failed to assess impact at tick {new_tick}: {e}") from e

    # 6. Evaluate alert state
    try:
        prev_alert = store.alerts.get(event_id, {}).get(old_tick)
        alert = alert_engine.build_alert(event_id, new_tick, impact, prev_alert.level if prev_alert else None)
        store.alerts.setdefault(event_id, {})[new_tick] = alert
        event.current_alert = alert.level
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Alert Layer] Failed to evaluate alert state at tick {new_tick}: {e}") from e

    # 7. Invoke operational response provider
    try:
        if providers.operations_provider:
            tasks = providers.operations_provider.generate_tasks(event_id, new_tick, state, alert, impact)
        else:
            tasks = generate_tasks(event_id, new_tick, state, alert, impact)
        store.tasks.setdefault(event_id, {})[new_tick] = tasks
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Operations Layer] Failed to generate operational tasks at tick {new_tick}: {e}") from e

    # 7b. RRAS — road status + resource allocation
    try:
        rras_out = rras_engine.build_rras_output(event_id, new_tick, impact, hazard, alert)
        store.rras.setdefault(event_id, {})[new_tick] = rras_out
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: RRAS Layer] Failed to generate RRAS allocation at tick {new_tick}: {e}") from e

    # 8. Append timeline events (if tick actually advanced)
    try:
        if new_tick > old_tick:
            tl.log_replay_advance(event_id, old_tick, new_tick, state.timestamp)
            tl.log_state_update(event_id, new_tick, state.timestamp,
                                state.intensity_kt, state.pressure_hpa,
                                state.lat, state.lon)

            if state.change_point and state.change_point.detected:
                tl.log_change_point(
                    event_id, new_tick, state.timestamp,
                    state.change_point.description,
                    state.change_point.from_regime.value if state.change_point.from_regime else None,
                    state.change_point.to_regime.value if state.change_point.to_regime else None,
                )

            prev_state = store.states.get(event_id, {}).get(old_tick)
            if prev_state and prev_state.regime != state.regime:
                tl.log_regime_change(event_id, new_tick, state.timestamp,
                                     prev_state.regime.value, state.regime.value)

            if prev_alert and alert_engine.has_escalated(alert):
                tl.log_alert_change(event_id, new_tick, state.timestamp,
                                    prev_alert.level.value, alert.level.value)

            tl.log_impact_update(event_id, new_tick, state.timestamp,
                                 impact.total_exposed_population, impact.time_to_impact_hours)

            for task in tasks:
                tl.log_task(event_id, new_tick, state.timestamp,
                            task.id, task.title, task.priority.value)

            tl.log_forecast_update(event_id, new_tick, state.timestamp,
                                   forecast.model_disagreement_score)
    except Exception as e:
        raise RuntimeError(f"[Pipeline Failure: Timeline Layer] Failed to append timeline entry at tick {new_tick}: {e}") from e

    # 9. Return the COMPLETE canonical event state
    return get_canonical_state(event_id, new_tick)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)


# ---------------------------------------------------------------------------
# reset()
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def reset(event_id: str) -> CycloneEvent:
    event = store.events.get(event_id)
    if not event:
        raise ValueError(f"Event {event_id} not found")

    event.current_tick = 0
    td = AMPHAN_TICKS[0]
    event.current_time = _utc(td["ts"])
    state = store.states[event_id][0]
=======
def reset(event_id: str) -> Dict[str, Any]:
    event = store.events.get(event_id)
    if not event:
        if event_id in ("DEMO-001", AMPHAN_EVENT_ID):
            seed_amphan(event_id)
            event = store.events.get(event_id)
        if not event:
            raise ValueError(f"Event {event_id} not found")

    event.current_tick = 0
    state = store.states[event_id][0]
    event.current_time = state.timestamp
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    event.current_state_id = state.id
    event.current_alert = AlertLevel.GREEN

    tl.clear_event(event_id)
<<<<<<< HEAD
    tl.log_replay_reset(event_id, _utc(td["ts"]))
    return event
=======
    tl.log_replay_reset(event_id, state.timestamp)
    return get_canonical_state(event_id, 0)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)


# ---------------------------------------------------------------------------
# goto(tick)  — jump to any tick directly
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def goto(event_id: str, tick: int) -> CycloneEvent:
    event = store.events.get(event_id)
    if not event:
        raise ValueError(f"Event {event_id} not found")
    reset(event_id)
    if tick > 0:
        advance(event_id, tick)
    return store.events[event_id]
=======
def goto(event_id: str, tick: int) -> Dict[str, Any]:
    event = store.events.get(event_id)
    if not event:
        if event_id in ("DEMO-001", AMPHAN_EVENT_ID):
            seed_amphan(event_id)
            event = store.events.get(event_id)
        if not event:
            raise ValueError(f"Event {event_id} not found")
    reset(event_id)
    if tick > 0:
        return advance(event_id, tick)
    return get_canonical_state(event_id, 0)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)


# ---------------------------------------------------------------------------
# Full reset + re-seed (demo safety net)
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def full_reset(event_id: str) -> CycloneEvent:
    for d in [store.events, store.states, store.forecasts, store.scenarios,
              store.hazards, store.impacts, store.alerts, store.tasks, store.outcomes]:
        d.pop(event_id, None)
    tl._timelines.pop(event_id, None)
    tl._audit.pop(event_id, None)
    return seed_amphan()
=======
def full_reset(event_id: str) -> Dict[str, Any]:
    for d in [store.events, store.states, store.snapshots, store.forecasts, store.scenarios,
              store.hazards, store.impacts, store.alerts, store.tasks, store.rras, store.outcomes]:
        d.pop(event_id, None)
    tl._timelines.pop(event_id, None)
    tl._audit.pop(event_id, None)
    seed_amphan(event_id)
    return get_canonical_state(event_id, 0)
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

