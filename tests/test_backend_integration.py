"""
CYCLONE-OS Integration Hardening Tests
Tests end-to-end replay advance, single event clock,
and canonical event response propagation.
"""
from fastapi.testclient import TestClient
import pytest
from backend.main import app
import backend.replay_engine as re

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_demo():
    client.post("/api/v1/events/DEMO-001/replay/reset")


def test_initial_state_t0():
    r = client.get("/api/v1/events/DEMO-001/state")
    assert r.status_code == 200
    state = r.json()
    assert state["tick"] == 0
    assert state["intensity_kt"] == 30.0


def test_canonical_advance_end_to_end():
    # 1. Advance tick 0 -> tick 1
    r_adv = client.post("/api/v1/events/DEMO-001/advance")
    assert r_adv.status_code == 200
    res = r_adv.json()

    # Canonical response schema check
    required_keys = [
        "event", "tick", "state", "intelligence",
        "forecasts", "scenarios", "hazards", "impact",
        "alert", "operations", "timeline"
    ]
    for k in required_keys:
        assert k in res, f"Missing key '{k}' in canonical advance response"

    assert res["tick"] == 1
    assert res["event"]["current_tick"] == 1
    assert res["state"]["tick"] == 1
    assert res["intelligence"]["tick"] == 1
    assert len(res["timeline"]) > 0

    # Verify GET /state corresponds to tick 1
    r_state = client.get("/api/v1/events/DEMO-001/state")
    assert r_state.status_code == 200
    state1 = r_state.json()
    assert state1["tick"] == 1
    assert state1["intensity_kt"] == 35.0


def test_replay_progression_through_t5():
    # Advance to T2
    client.post("/api/v1/events/DEMO-001/advance")
    r2 = client.post("/api/v1/events/DEMO-001/advance")
    res2 = r2.json()
    assert res2["tick"] == 2

    # Checkpoint 1: T3 - Degraded data / uncertainty spike
    r3 = client.post("/api/v1/events/DEMO-001/advance")
    res3 = r3.json()
    assert res3["tick"] == 3
    # Uncertainty spike check
    intel3 = res3["intelligence"]
    assert intel3["uncertainty"]["data_quality_flag"] == "DEGRADED_MW_MISSING"
    assert intel3["uncertainty"]["overall_uncertainty"] > 0.40
    # State observation quality reflects degraded freshness
    assert res3["state"]["observation_quality"]["freshness"] == "AGING"

    # Checkpoint 2: T4 - Regime transition & change_point detection
    r4 = client.post("/api/v1/events/DEMO-001/advance")
    res4 = r4.json()
    assert res4["tick"] == 4
    intel4 = res4["intelligence"]
    assert intel4["change_point"]["detected"] is True
    assert res4["state"]["change_point"]["detected"] is True
    assert res4["state"]["regime"] == "INTENSIFYING"

    # Checkpoint 3: T5 - Hazard expansion, impact update, and operations
    r5 = client.post("/api/v1/events/DEMO-001/advance")
    res5 = r5.json()
    assert res5["tick"] == 5
    assert res5["state"]["intensity_kt"] == 100.0
    # Impact changes (exposed population in hazard zone expands)
    assert res5["impact"]["total_exposed_population"] >= 1_200_000
    # Alert escalation active
    assert res5["alert"]["level"] in ("YELLOW", "ORANGE", "RED")
    # Operations received updated impact
    assert len(res5["operations"]) > 0
    tasks = res5["operations"]
    assert any(t["priority"] in ("HIGH", "CRITICAL") for t in tasks)

    # Continue to T6: TTI <= 48h -> Alert escalates to ORANGE
    r6 = client.post("/api/v1/events/DEMO-001/advance")
    res6 = r6.json()
    assert res6["tick"] == 6
    assert res6["alert"]["level"] == "ORANGE"

    # Continue to T8: TTI <= 24h -> Alert escalates to RED
    client.post("/api/v1/events/DEMO-001/advance") # T7
    r8 = client.post("/api/v1/events/DEMO-001/advance") # T8
    res8 = r8.json()
    assert res8["tick"] == 8
    assert res8["alert"]["level"] == "RED"

    # Verify single clock consistency across all subsystems
    state_get = client.get("/api/v1/events/DEMO-001/state").json()
    assert state_get["tick"] == 8
    event_get = client.get("/api/v1/events/DEMO-001").json()
    assert event_get["current_tick"] == 8
