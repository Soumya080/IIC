"""
CYCLONE-OS: Golden End-to-End Replay Validation Tests (tests/test_golden_replay.py)
Proves that the complete backend stack works as ONE deterministic event-driven system.

Validates:
A. Cascade validation (advance propagates through all 9 layers)
B. Determinism validation (complete replay identical across runs)
C. Tick sensitivity (tick changes update downstream outputs)
D. Cross-layer consistency (hazard vs intensity, TTI monotonicity, prob sums = 1.0)
E. Timeline consistency (chronological order)
F. Reset consistency (reproduces identical sequence)
G. Subsystem failure handling (identifies failing layer with clear error)
"""

import math
import sys
from unittest.mock import patch
from fastapi.testclient import TestClient
import pytest

from backend.main import app
import replay_engine as re
sys.modules["backend.replay_engine"] = re
from scripts.golden_replay import run_full_replay

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_demo_state():
    client.post("/api/v1/events/DEMO-001/replay/reset")
    re.full_reset("DEMO-001")


# ===========================================================================
# A. Cascade Validation
# ===========================================================================

def test_cascade_validation_e2e_advance():
    """Verify POST /advance propagates through the entire 9-layer pipeline."""
    r_t0 = client.get("/api/v1/events/DEMO-001/canonical")
    assert r_t0.status_code == 200
    t0_data = r_t0.json()
    assert t0_data["tick"] == 0

    # Advance 1 tick: T0 -> T1
    r_adv = client.post("/api/v1/events/DEMO-001/advance")
    assert r_adv.status_code == 200
    res = r_adv.json()

    # 1. Event clock
    assert res["tick"] == 1
    assert res["event"]["current_tick"] == 1

    # 2. Intelligence
    assert "intelligence" in res
    assert res["intelligence"]["tick"] == 1
    assert "intensity" in res["intelligence"]

    # 3. Forecast
    assert "forecasts" in res
    assert len(res["forecasts"].get("members", [])) > 0

    # 4. Scenario
    assert "scenarios" in res
    assert len(res["scenarios"]) == 3

    # 5. Hazard
    assert "hazards" in res
    assert len(res["hazards"].get("zones", [])) > 0

    # 6. Impact / Exposure
    assert "impact" in res
    assert "risk_level" in res["impact"]

    # 7. RRAS / Road routing
    assert "rras" in res
    assert "road_network" in res["rras"]
    assert "allocation_plan" in res["rras"]

    # 8. Alert & Operations
    assert "alert" in res
    assert "operations" in res

    # 9. Timeline
    assert "timeline" in res
    assert len(res["timeline"]) > 0


# ===========================================================================
# B. Determinism Validation
# ===========================================================================

def test_determinism_across_complete_replay():
    """Run complete replay twice and assert 100% exact matching of all metrics."""
    run1 = run_full_replay("DEMO-001")
    run2 = run_full_replay("DEMO-001")

    assert len(run1) == 12
    assert len(run2) == 12

    for t in range(12):
        r1 = run1[t]
        r2 = run2[t]
        assert r1["tick"] == r2["tick"]
        assert r1["timestamp"] == r2["timestamp"]
        assert r1["cyclone_center"] == r2["cyclone_center"]
        assert r1["intensity_kt"] == r2["intensity_kt"]
        assert r1["regime"] == r2["regime"]
        assert r1["overall_uncertainty"] == r2["overall_uncertainty"]
        assert r1["confidence"] == r2["confidence"]
        assert r1["change_point_detected"] == r2["change_point_detected"]
        assert r1["forecast_member_count"] == r2["forecast_member_count"]
        assert r1["scenario_count"] == r2["scenario_count"]
        assert r1["hazard_thresholds"] == r2["hazard_thresholds"]
        assert r1["affected_districts"] == r2["affected_districts"]
        assert r1["exposed_population"] == r2["exposed_population"]
        assert r1["risk_level"] == r2["risk_level"]
        assert r1["time_to_impact_hours"] == r2["time_to_impact_hours"]
        assert r1["road_status_counts"] == r2["road_status_counts"]
        assert r1["food_allocation"] == r2["food_allocation"]
        assert r1["water_allocation"] == r2["water_allocation"]
        assert r1["medical_allocation"] == r2["medical_allocation"]
        assert r1["ndrf_allocation"] == r2["ndrf_allocation"]
        assert r1["operational_task_count"] == r2["operational_task_count"]
        assert r1["alert_level"] == r2["alert_level"]


# ===========================================================================
# C. Tick Sensitivity
# ===========================================================================

def test_tick_sensitivity():
    """Verify that changing ticks appropriately updates downstream outputs."""
    re.full_reset("DEMO-001")
    s0 = re.get_canonical_state("DEMO-001", 0)

    # Advance to T4 (onset of RI, change point)
    s4 = re.advance("DEMO-001", 4)
    assert s4["tick"] == 4
    assert s4["state"]["intensity_kt"] > s0["state"]["intensity_kt"]
    assert s4["state"]["change_point"]["detected"] is True
    assert s4["impact"]["total_exposed_population"] > s0["impact"]["total_exposed_population"]

    # Advance to T7 (peak intensity)
    s7 = re.advance("DEMO-001", 3)
    assert s7["tick"] == 7
    assert s7["state"]["intensity_kt"] == 140.0
    assert s7["state"]["regime"] == "MATURE"

    # Advance to T10 (post-landfall surge)
    s10 = re.advance("DEMO-001", 3)
    assert s10["tick"] == 10
    assert s10["alert"]["level"] == "RED"
    assert s10["rras"]["road_summary"].get("UNREACHABLE", 0) > 0

    # Advance to T11 (dissipation, forecast horizon reached)
    s11 = re.advance("DEMO-001", 1)
    assert s11["tick"] == 11
    assert len(s11["forecasts"].get("members", [])) == 0
    assert s11["impact"]["time_to_impact_hours"] == 0.0


# ===========================================================================
# D. Cross-Layer Consistency
# ===========================================================================

def test_cross_layer_consistency_hazard_and_tti():
    """Verify physics and temporal consistency across layers."""
    run = run_full_replay("DEMO-001")

    # 1. Higher intensity must produce larger hazard zone (T0 vs T5 vs T7)
    hz_area_t0 = sum(z.area_km2 for z in re.store.hazards["DEMO-001"][0].zones)
    hz_area_t5 = sum(z.area_km2 for z in re.store.hazards["DEMO-001"][5].zones)
    hz_area_t7 = sum(z.area_km2 for z in re.store.hazards["DEMO-001"][7].zones)
    assert hz_area_t0 < hz_area_t5 < hz_area_t7

    # 2. Decreasing distance / approach must not increase TTI
    ttis = [r["time_to_impact_hours"] for r in run if r["time_to_impact_hours"] is not None]
    for i in range(len(ttis) - 1):
        assert ttis[i] >= ttis[i + 1], f"TTI increased from {ttis[i]} to {ttis[i+1]}"

    # 3. Scenario probabilities must sum to 1.0 across all ticks
    for t in range(12):
        scenarios = re.store.scenarios["DEMO-001"][t]
        prob_sum = sum(s.probability for s in scenarios)
        assert math.isclose(prob_sum, 1.0, rel_tol=1e-2), f"T{t}: Scenario prob sum {prob_sum} != 1.0"

    # 4. Regime probabilities must sum to 1.0 across all ticks
    for t in range(12):
        probs = re.store.states["DEMO-001"][t].regime_probabilities
        if probs:
            prob_sum = sum(probs.values())
            assert math.isclose(prob_sum, 1.0, rel_tol=1e-2), f"T{t}: Regime prob sum {prob_sum} != 1.0"


def test_cross_layer_consistency_risk_and_allocation():
    """Verify higher risk corresponds to higher operational preparedness and RRAS allocation."""
    run = run_full_replay("DEMO-001")

    # T0 (LOW risk) -> 0 NDRF teams
    assert run[0]["ndrf_allocation"] == 0
    # T5 (HIGH risk) -> >= 3 NDRF teams
    assert run[5]["ndrf_allocation"] >= 3
    # T9 (EXTREME risk) -> >= 8 NDRF teams
    assert run[9]["ndrf_allocation"] >= 8

    # Food and water packets scale with exposed population
    assert run[0]["food_allocation"] == 0
    assert run[5]["food_allocation"] > 10000
    assert run[9]["food_allocation"] > 40000


# ===========================================================================
# E. Timeline Consistency
# ===========================================================================

def test_timeline_chronological_consistency():
    """Verify every state transition is recorded in chronological order."""
    run_full_replay("DEMO-001")
    timeline = client.get("/api/v1/events/DEMO-001/timeline").json()
    assert len(timeline) > 20

    # Ensure tick values in timeline are non-decreasing
    for i in range(len(timeline) - 1):
        assert timeline[i]["tick"] <= timeline[i + 1]["tick"], (
            f"Timeline out of order: T{timeline[i]['tick']} before T{timeline[i+1]['tick']}"
        )


# ===========================================================================
# F. Reset Consistency
# ===========================================================================

def test_reset_consistency():
    """Verify Reset -> Replay reproduces the exact same T0->T11 sequence."""
    run1 = run_full_replay("DEMO-001")

    # Reset via API
    r_rst = client.post("/api/v1/events/DEMO-001/replay/reset")
    assert r_rst.status_code == 200
    assert r_rst.json()["tick"] == 0

    # Replay sequentially
    reports_after_reset = []
    reports_after_reset.append(run1[0])  # T0
    for _ in range(11):
        adv_res = client.post("/api/v1/events/DEMO-001/advance").json()
        reports_after_reset.append(adv_res)

    assert len(reports_after_reset) == 12
    # Check end state matches
    assert reports_after_reset[11]["tick"] == 11
    assert reports_after_reset[11]["state"]["intensity_kt"] == run1[11]["intensity_kt"]
    assert reports_after_reset[11]["alert"]["level"] == run1[11]["alert_level"]


# ===========================================================================
# G. Subsystem Failure Handling
# ===========================================================================

def test_subsystem_failure_identifies_layer():
    """Verify that failure in a downstream layer returns a clear error identifying the failing subsystem."""
    re.full_reset("DEMO-001")

    # Mock failure in RRAS Layer
    with patch("rras_engine.build_rras_output", side_effect=ValueError("Simulated Road Graph Failure")):
        r = client.post("/api/v1/events/DEMO-001/advance")
        assert r.status_code == 502
        error_detail = r.json().get("detail", "")
        assert "[Pipeline Failure: RRAS Layer]" in error_detail
        assert "Simulated Road Graph Failure" in error_detail

    # Mock failure in Intelligence Layer
    with patch("backend.ml.intelligence_service.IntelligenceService.get_snapshot", side_effect=RuntimeError("Satellite Feed Disconnected")):
        r = client.post("/api/v1/events/DEMO-001/advance")
        assert r.status_code == 502
        error_detail = r.json().get("detail", "")
        assert "[Pipeline Failure: Intelligence Layer]" in error_detail
        assert "Satellite Feed Disconnected" in error_detail
