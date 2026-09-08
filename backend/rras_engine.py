"""
CYCLONE-OS: rras_engine.py
Rapid Resource Allocation & Routing System (RRAS)

TARGET PIPELINE (consumes upstream outputs — never re-creates them):
    ImpactAssessment + Hazard
        -> Road Status  (NORMAL / REROUTED / BLOCKED / UNREACHABLE)
        -> Depot-to-Area resource allocation  (food, water, med_kits)
        -> Simulated operational routing plan

This module is SIMULATED.  All outputs are for decision-support demo only.
Never represent these as real government dispatch orders.

Member 4 — Hazard / Impact / Operations Architect
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

from schemas import (
    Alert, AlertLevel, HazardThreshold, ImpactAssessment, Hazard,
    OperationalTask, RiskLevel, TaskPriority, TaskStatus,
)


# ---------------------------------------------------------------------------
# Canonical Bay-of-Bengal road network for Amphan scenario
# Nodes: depots (DEP-*) and districts (district name).
# Edges carry: distance_km, base_risk (0-5)
# ---------------------------------------------------------------------------

_BOB_NODES: List[str] = [
    # NDRF / resource depots
    "DEP-BBS",          # Bhubaneswar depot
    "DEP-KOL",          # Kolkata depot
    "DEP-KON",          # Contai / coast depot
    # Coastal districts (high exposure)
    "Jagatsinghpur",
    "Kendrapara",
    "Bhadrak",
    "Balasore",
    "East Medinipur",
    "South 24 Parganas",
    "Kolkata",
    "Howrah",
    "Hooghly",
    "Nadia",
    "Murshidabad",
    "Puri",
    "Khordha",
]

# (from_node, to_node, distance_km, base_risk 0-5)
_BOB_EDGES: List[Tuple[str, str, float, int]] = [
    # Bhubaneswar depot connections
    ("DEP-BBS", "Puri",             55.0, 1),
    ("DEP-BBS", "Khordha",          25.0, 0),
    ("DEP-BBS", "Jagatsinghpur",    95.0, 2),
    ("DEP-BBS", "Bhadrak",         165.0, 2),
    # Coastal chain Odisha
    ("Puri",            "Khordha",          50.0, 1),
    ("Puri",            "Jagatsinghpur",    80.0, 2),
    ("Khordha",         "Jagatsinghpur",    70.0, 2),
    ("Jagatsinghpur",   "Kendrapara",       60.0, 3),
    ("Kendrapara",      "Bhadrak",          80.0, 3),
    ("Bhadrak",         "Balasore",         70.0, 3),
    # Balasore into West Bengal
    ("Balasore",        "East Medinipur",   90.0, 3),
    ("East Medinipur",  "South 24 Parganas", 120.0, 4),
    ("East Medinipur",  "DEP-KON",          40.0, 2),
    ("DEP-KON",         "South 24 Parganas", 80.0, 4),
    # Kolkata metro cluster
    ("South 24 Parganas", "Kolkata",        50.0, 3),
    ("South 24 Parganas", "Howrah",         55.0, 3),
    ("Kolkata",          "Howrah",          10.0, 1),
    ("Kolkata",          "DEP-KOL",          5.0, 0),
    ("DEP-KOL",          "Howrah",           8.0, 0),
    ("DEP-KOL",          "Hooghly",         50.0, 1),
    ("Howrah",           "Hooghly",         45.0, 1),
    ("Hooghly",          "Nadia",           60.0, 2),
    ("Nadia",            "Murshidabad",     80.0, 2),
]

# ---------------------------------------------------------------------------
# Road status thresholds derived from hazard zone + district exposure
# ---------------------------------------------------------------------------

# Districts known to be near 64kt radius at Amphan intensity levels
_HIGH_SURGE_DISTRICTS = {
    "South 24 Parganas", "East Medinipur", "Kendrapara",
    "Bhadrak", "Jagatsinghpur",
}
_MODERATE_SURGE_DISTRICTS = {
    "Balasore", "Puri", "Howrah", "Kolkata",
    "Hooghly", "Khordha",
}


def _edge_key(u: str, v: str) -> str:
    a, b = sorted([u, v])
    return f"{a}||{b}"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    d = math.radians
    dlat, dlon = d(lat2 - lat1), d(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(d(lat1)) * math.cos(d(lat2)) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(max(0.0, min(1.0, a))))


# ---------------------------------------------------------------------------
# Road status computation
# ---------------------------------------------------------------------------

class RoadSegment:
    """Single road segment between two nodes."""
    __slots__ = ("from_node", "to_node", "distance_km", "base_risk",
                 "status", "risk_override", "note")

    def __init__(self, u: str, v: str, dist: float, risk: int):
        self.from_node = u
        self.to_node = v
        self.distance_km = dist
        self.base_risk = risk
        self.status = "NORMAL"
        self.risk_override: int = risk
        self.note: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "edge": _edge_key(self.from_node, self.to_node),
            "from": self.from_node,
            "to": self.to_node,
            "distance_km": self.distance_km,
            "status": self.status,
            "risk_level": self.risk_override,
            "note": self.note,
        }


def compute_road_network(
    tick: int,
    intensity_kt: float,
    affected_districts: List[str],
    flood_risk_index: float,
    hazard: Optional[Hazard] = None,
) -> List[RoadSegment]:
    """
    Derive road status for every edge in the canonical network.

    Rules (deterministic, tick-dependent):
    - If both endpoints are in affected_districts AND intensity >= 64kt: BLOCKED
    - If one endpoint in affected_districts AND flood_risk > 0.35: REROUTED
    - If path leads into a 64kt zone: UNREACHABLE (post-landfall T9+)
    - Otherwise: NORMAL
    """
    affected_set = set(affected_districts)

    # Build 64kt-zone district set from hazard zones if available
    kt64_districts: set[str] = set()
    if hazard:
        for zone in hazard.zones:
            if zone.threshold == HazardThreshold.KT_64:
                # Any district tagged as high-surge is inside 64kt zone when active
                kt64_districts = _HIGH_SURGE_DISTRICTS.copy()

    segments: List[RoadSegment] = []
    for (u, v, dist, risk) in _BOB_EDGES:
        seg = RoadSegment(u, v, dist, risk)

        u_affected = u in affected_set
        v_affected = v in affected_set
        u_64kt = u in kt64_districts
        v_64kt = v in kt64_districts
        both_affected = u_affected and v_affected

        if tick >= 9:
            # Post-landfall: coastal arteries are destroyed
            if u in _HIGH_SURGE_DISTRICTS or v in _HIGH_SURGE_DISTRICTS:
                seg.status = "BLOCKED"
                seg.risk_override = 5
                seg.note = "Post-landfall surge damage — road closed"
            elif u in _MODERATE_SURGE_DISTRICTS or v in _MODERATE_SURGE_DISTRICTS:
                seg.status = "REROUTED"
                seg.risk_override = 4
                seg.note = "Flood debris — route diverted"

        elif intensity_kt >= 64 and (u_64kt or v_64kt):
            # 64kt wind zone active
            if both_affected and flood_risk_index > 0.45:
                seg.status = "BLOCKED"
                seg.risk_override = 5
                seg.note = f"Inside 64kt wind zone, flood index={flood_risk_index:.2f}"
            elif u_affected or v_affected:
                seg.status = "REROUTED"
                seg.risk_override = max(risk, 4)
                seg.note = "High wind zone — traffic rerouted"

        elif both_affected and flood_risk_index > 0.30:
            seg.status = "REROUTED"
            seg.risk_override = max(risk, 3)
            seg.note = f"Flood risk index={flood_risk_index:.2f}"

        elif (u_affected or v_affected) and intensity_kt >= 100:
            seg.status = "REROUTED"
            seg.risk_override = max(risk, 3)
            seg.note = "Extreme intensity advisory — alternative routes preferred"

        # UNREACHABLE: depot-to-high-surge when post-landfall AND no alt path
        if tick >= 10 and (v in _HIGH_SURGE_DISTRICTS or u in _HIGH_SURGE_DISTRICTS):
            seg.status = "UNREACHABLE"
            seg.risk_override = 5
            seg.note = "Primary access destroyed — awaiting cleared alternate route"

        segments.append(seg)

    return segments


# ---------------------------------------------------------------------------
# Simple shortest-path (Dijkstra) over derived road network
# ---------------------------------------------------------------------------

def _build_adj(segments: List[RoadSegment], alpha: float = 2.0) -> Dict[str, Dict[str, float]]:
    INF = 1e9
    adj: Dict[str, Dict[str, float]] = {}
    for seg in segments:
        if seg.status in ("BLOCKED", "UNREACHABLE"):
            w = INF
        else:
            w = seg.distance_km + alpha * seg.risk_override
        for u, v in [(seg.from_node, seg.to_node), (seg.to_node, seg.from_node)]:
            adj.setdefault(u, {})[v] = min(adj.get(u, {}).get(v, INF), w)
    return adj


def _dijkstra(adj: Dict[str, Dict[str, float]], src: str, dst: str) -> Dict[str, Any]:
    import heapq
    INF = 1e9
    dist: Dict[str, float] = {src: 0.0}
    prev: Dict[str, Optional[str]] = {src: None}
    heap = [(0.0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist.get(u, INF):
            continue
        if u == dst:
            break
        for v, w in adj.get(u, {}).items():
            nd = d + w
            if nd < dist.get(v, INF):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(heap, (nd, v))
    if dst not in dist or dist[dst] >= INF:
        return {"path": [], "total_km": None, "est_time_min": None, "reachable": False}
    path: List[str] = []
    cur: Optional[str] = dst
    while cur is not None:
        path.append(cur)
        cur = prev.get(cur)
    path.reverse()
    # Compute actual km along path (not weighted)
    actual_km = 0.0
    for a, b in zip(path[:-1], path[1:]):
        for seg in []:  # placeholder
            pass
    # Recompute real km
    seg_map: Dict[str, float] = {}
    return {
        "path": path,
        "total_km": round(dist[dst], 1),
        "est_time_min": round((dist[dst] / 25.0) * 60, 1),   # 25 km/h post-cyclone speed
        "reachable": True,
    }


# ---------------------------------------------------------------------------
# Resource depot definitions (derived from DEMO_RESOURCES in seed_data)
# ---------------------------------------------------------------------------

_DEPOTS = {
    "DEP-BBS": {"name": "NDRF Bhubaneswar Depot",  "lat": 20.29, "lon": 85.82,
                "food_units": 50000, "water_units": 80000, "med_kits": 600,
                "ndrf_teams": 3, "transport_vehicles": 20},
    "DEP-KOL": {"name": "NDRF Kolkata Depot",       "lat": 22.57, "lon": 88.36,
                "food_units": 80000, "water_units": 120000, "med_kits": 900,
                "ndrf_teams": 5, "transport_vehicles": 35},
    "DEP-KON": {"name": "Contai Forward Base",       "lat": 21.62, "lon": 87.51,
                "food_units": 20000, "water_units": 30000, "med_kits": 200,
                "ndrf_teams": 2, "transport_vehicles": 10},
}

# District -> lat/lon centroid
_DISTRICT_COORDS: Dict[str, Tuple[float, float]] = {
    "Puri":               (19.81, 85.83),
    "Khordha":            (20.18, 85.67),
    "Jagatsinghpur":      (20.31, 86.61),
    "Kendrapara":         (20.50, 86.42),
    "Bhadrak":            (21.06, 86.49),
    "Balasore":           (21.49, 86.93),
    "East Medinipur":     (21.62, 87.51),
    "South 24 Parganas":  (22.00, 88.30),
    "Kolkata":            (22.57, 88.36),
    "Howrah":             (22.58, 88.30),
    "Hooghly":            (22.90, 88.40),
    "Nadia":              (23.47, 88.56),
    "Murshidabad":        (24.18, 88.27),
}


# ---------------------------------------------------------------------------
# Resource allocation logic
# ---------------------------------------------------------------------------

def _severity_from_risk(risk_level: str, intensity_kt: float, tti_hours: Optional[float]) -> float:
    """Map categorical risk → 1-5 severity float for allocation math."""
    base = {"LOW": 1.0, "MODERATE": 2.5, "HIGH": 3.5, "EXTREME": 5.0}.get(risk_level, 2.0)
    if tti_hours is not None and tti_hours <= 24:
        base = min(5.0, base + 0.5)
    if intensity_kt >= 120:
        base = min(5.0, base + 0.5)
    return base


def _nearest_depot(district: str) -> str:
    """Return depot ID closest (haversine) to the district centroid."""
    coords = _DISTRICT_COORDS.get(district)
    if not coords:
        return "DEP-KOL"
    dlat, dlon = coords
    best_dep, best_d = "DEP-KOL", 1e9
    for dep_id, dep in _DEPOTS.items():
        d = _haversine_km(dlat, dlon, dep["lat"], dep["lon"])
        if d < best_d:
            best_d = d
            best_dep = dep_id
    return best_dep


def allocate_resources(
    affected_districts: List[str],
    total_exposed_population: int,
    risk_level: str,
    intensity_kt: float,
    tti_hours: Optional[float],
    segments: List[RoadSegment],
) -> List[Dict[str, Any]]:
    """
    Compute per-district resource allocation and routing plan.
    Returns list of allocation trip dicts.
    """
    if not affected_districts or total_exposed_population == 0:
        return []

    adj = _build_adj(segments)
    allocations: List[Dict[str, Any]] = []
    pop_per_district = max(1, total_exposed_population // max(len(affected_districts), 1))

    for district in affected_districts:
        if district not in _DISTRICT_COORDS:
            continue
        sev = _severity_from_risk(risk_level, intensity_kt, tti_hours)
        sev_factor = 0.5 + 0.5 * (sev / 5.0)
        pop = pop_per_district
        base = pop * sev_factor

        food   = max(0, int(base * 0.015))
        water  = max(0, int(base * 0.020))
        med_kits = max(0, int(sev * 12))
        ndrf_teams = max(0, int(sev / 2))
        priority_score = round(sev * 2 + (pop / 100_000), 3)

        depot_id = _nearest_depot(district)
        route = _dijkstra(adj, depot_id, district)

        # Determine effective road status for this trip
        path = route.get("path", [])
        path_set = set(path)
        trip_blocked = not route["reachable"]
        trip_rerouted = any(
            seg.status == "REROUTED"
            and seg.from_node in path_set
            and seg.to_node in path_set
            for seg in segments
        )
        d_lat, d_lon = _DEPOTS[depot_id]["lat"], _DEPOTS[depot_id]["lon"]
        t_lat, t_lon = _DISTRICT_COORDS[district]
        direct_air_km = round(_haversine_km(d_lat, d_lon, t_lat, t_lon), 1)

        if trip_blocked:
            access_status = "NO_ACCESS"
            total_km = direct_air_km
            # Helicopter airlift / boat drop speed (120 km/h flight speed + 25 mins drop buffer)
            est_time_min = round((direct_air_km / 120.0) * 60 + 25, 1)
        elif trip_rerouted:
            access_status = "REROUTED"
            total_km = route.get("total_km") or direct_air_km
            est_time_min = route.get("est_time_min") or round((total_km / 25.0) * 60, 1)
        else:
            access_status = "CLEAR"
            total_km = route.get("total_km") or direct_air_km
            est_time_min = route.get("est_time_min") or round((total_km / 40.0) * 60, 1)

        allocations.append({
            "district": district,
            "depot_id": depot_id,
            "depot_name": _DEPOTS[depot_id]["name"],
            "path": route.get("path") if route.get("path") else [depot_id, district],
            "total_km": total_km,
            "est_time_min": est_time_min,
            "reachable": route["reachable"],
            "access_status": access_status,
            "food_units": food,
            "water_units": water,
            "med_kits": med_kits,
            "ndrf_teams": ndrf_teams,
            "priority_score": priority_score,
            "severity": round(sev, 2),
            "population": pop,
            "source": "SIMULATED_RRAS",
            "disclaimer": "SIMULATED — not official government dispatch",
        })

    # Sort by priority descending
    allocations.sort(key=lambda x: x["priority_score"], reverse=True)
    return allocations


# ---------------------------------------------------------------------------
# RRAS summary builder
# ---------------------------------------------------------------------------

def build_rras_output(
    event_id: str,
    tick: int,
    impact: ImpactAssessment,
    hazard: Optional[Hazard],
    alert: Optional[Alert] = None,
) -> Dict[str, Any]:
    """
    Master entry point.  Called by replay_engine.advance() and get_canonical_state().

    Returns a single RRAS output dict containing:
        - road_network: list of road segment statuses
        - allocation_plan: list of depot-to-district resource trips
        - summary: key metrics
    """
    affected = impact.affected_districts or []
    flood_idx = impact.flood_risk_index or 0.0
    intensity = getattr(impact, "_intensity_kt", None)  # may not be stored on impact

    # Derive intensity from the hazard zones (64kt zone presence → ≥ 64kt)
    inferred_intensity = 34.0
    if hazard:
        thresholds_present = {z.threshold for z in hazard.zones}
        if HazardThreshold.KT_64 in thresholds_present:
            inferred_intensity = 100.0    # conservative
        elif HazardThreshold.KT_50 in thresholds_present:
            inferred_intensity = 60.0
        elif HazardThreshold.KT_34 in thresholds_present:
            inferred_intensity = 40.0
    if intensity:
        inferred_intensity = intensity

    segments = compute_road_network(
        tick=tick,
        intensity_kt=inferred_intensity,
        affected_districts=affected,
        flood_risk_index=flood_idx,
        hazard=hazard,
    )

    allocation_plan = allocate_resources(
        affected_districts=affected,
        total_exposed_population=impact.total_exposed_population,
        risk_level=impact.risk_level.value if hasattr(impact.risk_level, "value") else str(impact.risk_level),
        intensity_kt=inferred_intensity,
        tti_hours=impact.time_to_impact_hours,
        segments=segments,
    )

    # Road network stats
    status_counts: Dict[str, int] = {}
    for seg in segments:
        status_counts[seg.status] = status_counts.get(seg.status, 0) + 1

    blocked_routes = [s.to_dict() for s in segments if s.status in ("BLOCKED", "UNREACHABLE")]
    rerouted_routes = [s.to_dict() for s in segments if s.status == "REROUTED"]
    all_routes = [s.to_dict() for s in segments]

    total_resources = {
        "food_units": sum(a["food_units"] for a in allocation_plan),
        "water_units": sum(a["water_units"] for a in allocation_plan),
        "med_kits": sum(a["med_kits"] for a in allocation_plan),
        "ndrf_teams": sum(a["ndrf_teams"] for a in allocation_plan),
    }

    unreachable_districts = [
        a["district"] for a in allocation_plan if not a["reachable"]
    ]

    return {
        "event_id": event_id,
        "tick": tick,
        "road_network": {
            "segments": all_routes,
            "total_segments": len(segments),
            "status_counts": status_counts,
            "blocked": blocked_routes,
            "rerouted": rerouted_routes,
        },
        "allocation_plan": allocation_plan,
        "summary": {
            "districts_covered": len(allocation_plan),
            "districts_unreachable": len(unreachable_districts),
            "unreachable_districts": unreachable_districts,
            "total_exposed_population": impact.total_exposed_population,
            "tti_hours": impact.time_to_impact_hours,
            "risk_level": impact.risk_level.value if hasattr(impact.risk_level, "value") else str(impact.risk_level),
            "total_resources_mobilized": total_resources,
            "road_status_counts": status_counts,
        },
        "source": "SIMULATED_RRAS",
        "road_summary": status_counts,
        "total_allocated": total_resources,
        "disclaimer": (
            "SIMULATED RESPONSE INTELLIGENCE — "
            "Never represent as real emergency dispatch. "
            "For real emergencies dial 112."
        ),
    }


# ---------------------------------------------------------------------------
# OperationsProvider implementation (plugs into providers.py registry)
# ---------------------------------------------------------------------------

class RRASOperationsProvider:
    """
    Concrete OperationsProvider that uses the RRAS engine.
    Registered in providers.py; called by replay_engine.advance().
    Returns List[OperationalTask] for the operations field.
    """

    def generate_tasks(
        self,
        event_id: str,
        tick: int,
        state: Any,
        alert: Any,
        impact: ImpactAssessment,
    ) -> list:
        """Delegate to replay_engine.generate_tasks (unchanged) — RRAS is surfaced separately."""
        # Import here to avoid circular dependency
        from replay_engine import generate_tasks
        return generate_tasks(event_id, tick, state, alert, impact)
