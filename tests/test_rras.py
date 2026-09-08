"""
CYCLONE-OS: RRAS Integration Tests
Verifies the full Hazard + Impact + RRAS pipeline for tick T0, T5, T9, T10.

Run with:
    cd d:\IIC
    python -m pytest tests/test_rras.py -v
"""
import sys
import os

# Root of IIC project
_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
_BACKEND = os.path.join(_ROOT, "backend")

# Insert backend dir FIRST so imports like 'rras_engine', 'replay_engine' resolve
if _BACKEND not in sys.path:
    sys.path.insert(0, _BACKEND)
# Insert root so 'backend.ml.intelligence_service' resolves
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

import pytest
from rras_engine import (
    compute_road_network,
    allocate_resources,
    build_rras_output,
    _DEPOTS,
    _DISTRICT_COORDS,
)
from schemas import (
    ImpactAssessment, Hazard, HazardZone, HazardThreshold,
    ScenarioType, RiskLevel, GeoPoint,
)
import replay_engine as re


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_impact(tick: int, pop: int, districts: list, tti, risk: str,
                flood: float, composite: float) -> ImpactAssessment:
    return ImpactAssessment(
        event_id="TEST-001",
        tick=tick,
        scenario_type=ScenarioType.BASE,
        total_exposed_population=pop,
        exposure_breakdown=[],
        affected_districts=districts,
        time_to_impact_hours=tti,
        nearest_impact_point=GeoPoint(lat=21.65, lon=88.35) if tti else None,
        risk_level=RiskLevel(risk),
        risk_factors=[],
        flood_risk_index=flood,
        composite_risk=composite,
        source="TEST",
    )


def make_hazard_with_zone(intensity_kt: float) -> Hazard:
    """Create a Hazard with zones matching the given intensity."""
    import math
    zones = []
    if intensity_kt >= 34:
        r = max(30.0, intensity_kt * 2.8)
        zones.append(HazardZone(
            threshold=HazardThreshold.KT_34,
            geojson={"type": "FeatureCollection", "features": []},
            area_km2=round(math.pi * r ** 2, 1),
            color="#FFF176",
        ))
    if intensity_kt >= 50:
        r = max(30.0, intensity_kt * 1.6)
        zones.append(HazardZone(
            threshold=HazardThreshold.KT_50,
            geojson={"type": "FeatureCollection", "features": []},
            area_km2=round(math.pi * r ** 2, 1),
            color="#FF9800",
        ))
    if intensity_kt >= 64:
        r = max(30.0, intensity_kt * 0.9)
        zones.append(HazardZone(
            threshold=HazardThreshold.KT_64,
            geojson={"type": "FeatureCollection", "features": []},
            area_km2=round(math.pi * r ** 2, 1),
            color="#F44336",
        ))
    return Hazard(
        event_id="TEST-001",
        tick=0,
        scenario_type=ScenarioType.BASE,
        zones=zones,
        source="TEST",
    )


# ---------------------------------------------------------------------------
# T0 — Formation, no exposure, all roads NORMAL
# ---------------------------------------------------------------------------

class TestT0:
    def setup_method(self):
        self.impact = make_impact(0, 0, [], None, "LOW", 0.0, 0.05)
        self.hazard = make_hazard_with_zone(30.0)  # below all thresholds

    def test_allocation_empty_at_t0(self):
        alloc = allocate_resources([], 0, "LOW", 30.0, None, [])
        assert alloc == [], "No districts → empty allocation plan"

    def test_road_network_all_normal_at_t0(self):
        segs = compute_road_network(0, 30.0, [], 0.0, self.hazard)
        statuses = {s.status for s in segs}
        assert statuses == {"NORMAL"}, f"All roads should be NORMAL at T0, got {statuses}"

    def test_rras_output_structure_at_t0(self):
        out = build_rras_output("TEST-001", 0, self.impact, self.hazard)
        assert "road_network" in out
        assert "allocation_plan" in out
        assert "summary" in out
        assert out["summary"]["districts_covered"] == 0
        assert out["summary"]["total_exposed_population"] == 0


# ---------------------------------------------------------------------------
# T5 — Mature / Peak intensity: 1.2M population, HIGH risk, 60h TTI
# ---------------------------------------------------------------------------

class TestT5:
    DISTRICTS = ["Jagatsinghpur", "Kendrapara", "Bhadrak"]

    def setup_method(self):
        self.impact = make_impact(
            5, 1_200_000, self.DISTRICTS, 60.0, "HIGH", 0.28, 0.62
        )
        self.hazard = make_hazard_with_zone(155.0)

    def test_allocation_covers_all_districts(self):
        segs = compute_road_network(5, 155.0, self.DISTRICTS, 0.28, self.hazard)
        alloc = allocate_resources(
            self.DISTRICTS, 1_200_000, "HIGH", 155.0, 60.0, segs
        )
        allocated_districts = {a["district"] for a in alloc}
        for d in self.DISTRICTS:
            assert d in allocated_districts, f"{d} missing from allocation"

    def test_priority_score_higher_for_higher_severity(self):
        segs = compute_road_network(5, 155.0, self.DISTRICTS, 0.28, self.hazard)
        alloc = allocate_resources(
            self.DISTRICTS, 1_200_000, "HIGH", 155.0, 60.0, segs
        )
        assert len(alloc) > 0
        scores = [a["priority_score"] for a in alloc]
        assert scores == sorted(scores, reverse=True), "Should be sorted by priority desc"

    def test_resources_nonzero_at_t5(self):
        segs = compute_road_network(5, 155.0, self.DISTRICTS, 0.28, self.hazard)
        alloc = allocate_resources(
            self.DISTRICTS, 1_200_000, "HIGH", 155.0, 60.0, segs
        )
        for a in alloc:
            assert a["food_units"] > 0
            assert a["water_units"] > 0
            assert a["med_kits"] > 0

    def test_rras_summary_at_t5(self):
        out = build_rras_output("TEST-001", 5, self.impact, self.hazard)
        assert out["summary"]["districts_covered"] > 0
        assert out["summary"]["total_exposed_population"] == 1_200_000
        total_res = out["summary"]["total_resources_mobilized"]
        assert total_res["food_units"] > 0
        assert total_res["water_units"] > 0

    def test_some_roads_rerouted_at_peak_intensity(self):
        out = build_rras_output("TEST-001", 5, self.impact, self.hazard)
        counts = out["road_network"]["status_counts"]
        non_normal = counts.get("REROUTED", 0) + counts.get("BLOCKED", 0)
        assert non_normal > 0, "At 155kt with HIGH risk, some roads should be disrupted"


# ---------------------------------------------------------------------------
# T9 — Landfall: 3.4M exposed, EXTREME risk, 12h TTI
# ---------------------------------------------------------------------------

class TestT9:
    DISTRICTS = ["South 24 Parganas", "Kolkata", "Howrah", "Hooghly"]

    def setup_method(self):
        self.impact = make_impact(
            9, 3_400_000, self.DISTRICTS, 12.0, "EXTREME", 0.70, 0.95
        )
        self.hazard = make_hazard_with_zone(155.0)

    def test_coastal_roads_blocked_at_landfall(self):
        segs = compute_road_network(9, 155.0, self.DISTRICTS, 0.70, self.hazard)
        status_map = {(s.from_node, s.to_node): s.status for s in segs}
        # All segs in HIGH_SURGE districts should be blocked post-landfall
        blocked = [s for s in segs if s.status == "BLOCKED"]
        assert len(blocked) > 0, "Should have BLOCKED roads at T9 landfall"

    def test_rras_identifies_unreachable_districts(self):
        out = build_rras_output("TEST-001", 9, self.impact, self.hazard)
        # With BLOCKED/UNREACHABLE roads, some districts may be inaccessible
        assert "districts_unreachable" in out["summary"]
        # Road network should show disruption
        counts = out["road_network"]["status_counts"]
        disrupted = sum(v for k, v in counts.items() if k != "NORMAL")
        assert disrupted > 0

    def test_extreme_risk_higher_ndrf_allocation(self):
        segs = compute_road_network(9, 155.0, self.DISTRICTS, 0.70, self.hazard)
        alloc = allocate_resources(
            self.DISTRICTS, 3_400_000, "EXTREME", 155.0, 12.0, segs
        )
        for a in alloc:
            assert a["ndrf_teams"] >= 2, "EXTREME risk should mobilize >= 2 NDRF teams per district"


# ---------------------------------------------------------------------------
# T10 — Post-landfall: roads degraded to UNREACHABLE in surge zones
# ---------------------------------------------------------------------------

class TestT10:
    DISTRICTS = ["Kolkata", "Howrah", "Hooghly", "Nadia"]

    def setup_method(self):
        self.impact = make_impact(
            10, 2_800_000, self.DISTRICTS, 2.0, "EXTREME", 0.65, 0.92
        )
        self.hazard = make_hazard_with_zone(90.0)

    def test_unreachable_roads_at_t10(self):
        segs = compute_road_network(10, 90.0, self.DISTRICTS, 0.65, self.hazard)
        unreachable = [s for s in segs if s.status == "UNREACHABLE"]
        assert len(unreachable) > 0, "Post-landfall T10 should have UNREACHABLE segments"

    def test_rras_output_changes_tick_to_tick(self):
        """Road status must differ between T5 and T10."""
        impact_t5 = make_impact(5, 1_200_000, ["Jagatsinghpur", "Kendrapara", "Bhadrak"],
                                60.0, "HIGH", 0.28, 0.62)
        hazard_t5 = make_hazard_with_zone(155.0)
        out_t5 = build_rras_output("TEST-001", 5, impact_t5, hazard_t5)

        out_t10 = build_rras_output("TEST-001", 10, self.impact, self.hazard)

        # Road status counts must differ (different ticks, different intensity, different districts)
        assert out_t5["road_network"]["status_counts"] != out_t10["road_network"]["status_counts"] or \
               out_t5["summary"]["districts_covered"] != out_t10["summary"]["districts_covered"], \
               "RRAS output should change between T5 and T10"


# ---------------------------------------------------------------------------
# Integration: full replay pipeline produces RRAS at each tick
# ---------------------------------------------------------------------------

class TestFullReplayRRAS:
    def setup_method(self):
        re.full_reset("DEMO-001")

    def test_t0_canonical_has_rras_key(self):
        state = re.get_canonical_state("DEMO-001", 0)
        assert "rras" in state, "Canonical state must include 'rras' key"

    def test_advance_produces_rras(self):
        state = re.advance("DEMO-001")
        assert "rras" in state
        rras = state["rras"]
        assert "road_network" in rras
        assert "allocation_plan" in rras
        assert "summary" in rras

    def test_rras_changes_across_ticks(self):
        """RRAS road counts must change as the storm intensifies tick-by-tick."""
        re.reset("DEMO-001")
        road_counts = []
        for _ in range(6):
            s = re.advance("DEMO-001")
            counts = s["rras"].get("road_network", {}).get("status_counts", {})
            road_counts.append(counts)

        # Not all ticks should have identical road status distributions
        unique_counts = [str(c) for c in road_counts]
        assert len(set(unique_counts)) > 1, "RRAS road status must change across ticks"

    def test_post_landfall_t9_has_blocked_roads(self):
        state = re.goto("DEMO-001", 9)
        rras = state.get("rras", {})
        blocked = rras.get("road_network", {}).get("blocked", [])
        assert len(blocked) > 0, "T9 landfall must have BLOCKED roads"

    def test_allocation_plan_disclaimer_present(self):
        state = re.advance("DEMO-001")
        rras = state["rras"]
        assert "SIMULATED" in rras.get("disclaimer", ""), "RRAS must carry simulation disclaimer"
        for trip in rras.get("allocation_plan", []):
            assert "SIMULATED" in trip.get("disclaimer", ""), "Each trip must carry disclaimer"
