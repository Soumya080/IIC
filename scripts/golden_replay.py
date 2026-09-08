#!/usr/bin/env python3
"""
CYCLONE-OS: Golden End-to-End Replay Runner (scripts/golden_replay.py)
Executes a deterministic event-driven replay from T0 to T11 without frontend dependency.

Verifies the entire canonical pipeline:
    Event Clock -> IntelligenceService -> Forecasts -> Scenarios ->
    Hazard Footprint -> Impact/Exposure -> Time-to-Impact ->
    RRAS Allocation -> Road/Routing -> Operations -> Alert State -> Timeline

Reports all 21 canonical metrics per tick and verifies determinism across runs.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any, Dict, List

# Setup sys.path to locate backend and project root
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_SCRIPT_DIR)
_BACKEND_DIR = os.path.join(_PROJECT_ROOT, "backend")

if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

import replay_engine as re


def extract_tick_report(canonical: Dict[str, Any]) -> Dict[str, Any]:
    """Extract the 21 required metrics from a canonical event state snapshot."""
    tick = canonical["tick"]
    state = canonical.get("state", {})
    intel = canonical.get("intelligence", {})
    fc = canonical.get("forecasts", {})
    sc = canonical.get("scenarios", [])
    hz = canonical.get("hazards", {})
    imp = canonical.get("impact", {})
    alt = canonical.get("alert", {})
    ops = canonical.get("operations", [])
    rras = canonical.get("rras", {})

    # 1. tick
    t = tick

    # 2. timestamp
    ts = str(state.get("timestamp") or intel.get("timestamp") or "")

    # 3. cyclone center
    lat = state.get("lat") or (intel.get("center", {}).get("lat") if intel.get("center") else 0.0)
    lon = state.get("lon") or (intel.get("center", {}).get("lon") if intel.get("center") else 0.0)
    center = {"lat": round(float(lat), 2), "lon": round(float(lon), 2)}

    # 4. intensity
    intensity = float(state.get("intensity_kt", 0.0))

    # 5. regime
    regime = str(state.get("regime") or intel.get("regime", {}).get("dominant_regime") or "UNKNOWN")

    # 6. uncertainty / confidence
    uncert_info = intel.get("uncertainty", {})
    overall_uncert = float(uncert_info.get("overall_uncertainty", 0.0))
    confidence = float(state.get("confidence", 1.0 - overall_uncert))

    # 7. change-point state
    cp_info = state.get("change_point", {}) or intel.get("change_point", {})
    cp_detected = bool(cp_info.get("detected", False))
    cp_desc = str(cp_info.get("description", ""))

    # 8. forecast member count
    fc_members = fc.get("members", [])
    fc_count = len(fc_members)

    # 9. scenario count
    sc_count = len(sc)

    # 10. hazard thresholds
    hz_zones = hz.get("zones", [])
    hz_thresholds = [z.get("threshold") for z in hz_zones if "threshold" in z]

    # 11. affected districts
    aff_districts = imp.get("affected_districts", [])

    # 12. exposed population
    exposed_pop = int(imp.get("total_exposed_population", 0))

    # 13. risk level
    risk_level = str(imp.get("risk_level") or "LOW")

    # 14. time-to-impact
    tti = imp.get("time_to_impact_hours")

    # 15. road status counts
    road_counts = rras.get("road_summary") or rras.get("road_network", {}).get("status_counts", {})

    # 16-19. resource allocations
    alloc = rras.get("total_allocated") or rras.get("summary", {}).get("total_resources_mobilized", {})
    food = int(alloc.get("food_units", 0) or alloc.get("food_packets", 0))
    water = int(alloc.get("water_units", 0) or alloc.get("drinking_water_liters", 0))
    medical = int(alloc.get("med_kits", 0) or alloc.get("medical_kits", 0))
    ndrf = int(alloc.get("ndrf_teams", 0))

    # 20. operational state
    active_tasks = len(ops)
    top_tasks = [t_.get("title", "") for t_ in ops[:2]]

    # 21. alert level
    alert_level = str(alt.get("level") or "GREEN")

    return {
        "tick": t,
        "timestamp": ts,
        "cyclone_center": center,
        "intensity_kt": intensity,
        "regime": regime,
        "overall_uncertainty": round(overall_uncert, 4),
        "confidence": round(confidence, 4),
        "change_point_detected": cp_detected,
        "change_point_description": cp_desc,
        "forecast_member_count": fc_count,
        "scenario_count": sc_count,
        "hazard_thresholds": hz_thresholds,
        "affected_districts": aff_districts,
        "exposed_population": exposed_pop,
        "risk_level": risk_level,
        "time_to_impact_hours": tti,
        "road_status_counts": road_counts,
        "food_allocation": food,
        "water_allocation": water,
        "medical_allocation": medical,
        "ndrf_allocation": ndrf,
        "operational_task_count": active_tasks,
        "operational_sample_tasks": top_tasks,
        "alert_level": alert_level,
    }


def run_full_replay(event_id: str = "DEMO-001") -> List[Dict[str, Any]]:
    """Execute the full sequence from T0 through T11 and extract reports."""
    re.full_reset(event_id)
    tick_reports: List[Dict[str, Any]] = []

    # T0
    t0_state = re.get_canonical_state(event_id, 0)
    tick_reports.append(extract_tick_report(t0_state))

    # T1 through T11
    for step in range(1, 12):
        step_state = re.advance(event_id, 1)
        tick_reports.append(extract_tick_report(step_state))

    return tick_reports


def print_summary_table(reports: List[Dict[str, Any]]) -> None:
    """Print a clean, formatted summary table to console."""
    sep = "=" * 126
    sub_sep = "-" * 126
    print("\n" + sep)
    print("CYCLONE-OS GOLDEN REPLAY: CANONICAL EVENT SUMMARY (T0 -> T11)")
    print(sep)
    header = (
        f"{'Tick':4s} | {'Time (UTC)':16s} | {'Center':12s} | {'Wind':5s} | "
        f"{'Regime':13s} | {'Uncert':6s} | {'CP':5s} | {'FC':2s} | {'SC':2s} | "
        f"{'Exposed Pop':11s} | {'Risk':7s} | {'TTI':5s} | {'Alert':6s} | "
        f"{'Ops':3s} | {'Food':6s} | {'NDRF':4s} | {'Roads'}"
    )
    print(header)
    print(sub_sep)

    for r in reports:
        t_str = f"T{r['tick']:02d}"
        ts_str = r['timestamp'][:16].replace("T", " ")
        c_str = f"({r['cyclone_center']['lat']:4.1f},{r['cyclone_center']['lon']:4.1f})"
        w_str = f"{r['intensity_kt']:3.0f}kt"
        reg_str = f"{r['regime']:13s}"
        unc_str = f"{r['overall_uncertainty']:.3f}"
        cp_str = "YES" if r['change_point_detected'] else "no"
        fc_str = f"{r['forecast_member_count']:2d}"
        sc_str = f"{r['scenario_count']:2d}"
        pop_str = f"{r['exposed_population']:11,d}"
        risk_str = f"{r['risk_level']:7s}"
        tti_str = f"{r['time_to_impact_hours']:4.0f}h" if r['time_to_impact_hours'] is not None else " None"
        alt_str = f"{r['alert_level']:6s}"
        ops_str = f"{r['operational_task_count']:3d}"
        food_str = f"{r['food_allocation']:6d}"
        ndrf_str = f"{r['ndrf_allocation']:4d}"
        roads_str = str(r['road_status_counts'])

        line = (
            f"{t_str:4s} | {ts_str:16s} | {c_str:12s} | {w_str:5s} | "
            f"{reg_str:13s} | {unc_str:6s} | {cp_str:5s} | {fc_str:2s} | {sc_str:2s} | "
            f"{pop_str:11s} | {risk_str:7s} | {tti_str:5s} | {alt_str:6s} | "
            f"{ops_str:3s} | {food_str:6s} | {ndrf_str:4s} | {roads_str}"
        )
        print(line)

    print(sep + "\n")


def verify_downstream_layers_populated(reports: List[Dict[str, Any]]) -> None:
    """Verify that every required layer is properly populated across all ticks."""
    for r in reports:
        t = r["tick"]
        assert r["timestamp"], f"T{t}: Missing timestamp"
        assert r["cyclone_center"]["lat"] > 0, f"T{t}: Invalid latitude"
        assert r["cyclone_center"]["lon"] > 0, f"T{t}: Invalid longitude"
        assert r["intensity_kt"] >= 25.0, f"T{t}: Intensity below minimum threshold"
        assert r["regime"], f"T{t}: Missing regime"
        assert 0.0 <= r["overall_uncertainty"] <= 1.0, f"T{t}: Uncertainty out of bounds"
        assert 0.0 <= r["confidence"] <= 1.0, f"T{t}: Confidence out of bounds"
        assert r["scenario_count"] == 3, f"T{t}: Expected 3 scenarios, got {r['scenario_count']}"
        assert r["alert_level"] in ("GREEN", "YELLOW", "ORANGE", "RED"), f"T{t}: Invalid alert level {r['alert_level']}"
        assert isinstance(r["road_status_counts"], dict), f"T{t}: Missing road status counts"

    # Specific phase checks
    # T0: Genesis - pop 0, normal roads, 0 resource allocation
    assert reports[0]["exposed_population"] == 0
    assert reports[0]["food_allocation"] == 0
    assert reports[0]["ndrf_allocation"] == 0
    assert reports[0]["road_status_counts"].get("NORMAL") == 23

    # T3: Uncertainty degradation
    assert reports[3]["overall_uncertainty"] > 0.40

    # T4: Change-point detected
    assert reports[4]["change_point_detected"] is True

    # T7: Peak intensity
    assert reports[7]["intensity_kt"] == 140.0

    # T9: Landfall imminent
    assert reports[9]["risk_level"] == "EXTREME"
    assert reports[9]["alert_level"] == "RED"
    assert reports[9]["ndrf_allocation"] >= 8

    # T10: Severe network degradation
    t10_roads = reports[10]["road_status_counts"]
    assert (t10_roads.get("UNREACHABLE", 0) + t10_roads.get("BLOCKED", 0)) > 10

    # T11: Dissipation - horizon reached, 0 future forecast members
    assert reports[11]["forecast_member_count"] == 0
    assert reports[11]["time_to_impact_hours"] == 0.0


def main() -> None:
    print("[1/4] Running Initial Golden Replay (Run 1: T0 -> T11)...")
    run1 = run_full_replay("DEMO-001")

    print("[2/4] Validating Downstream Layer Population across all 12 ticks...")
    verify_downstream_layers_populated(run1)

    print("[3/4] Running Determinism Verification Replay (Run 2: T0 -> T11)...")
    run2 = run_full_replay("DEMO-001")

    # Assert exact determinism across both runs
    assert run1 == run2, "Determinism check failed: Run 1 and Run 2 produced different outputs!"
    print("      -> DETERMINISM VERIFIED: Run 1 and Run 2 match 100% identically across all 12 ticks.")

    print("[4/4] Generating Machine-Readable JSON and Terminal Summary Table...")
    demo_dir = os.path.join(_PROJECT_ROOT, "demo")
    os.makedirs(demo_dir, exist_ok=True)
    out_file = os.path.join(demo_dir, "golden_replay_output.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "event_id": "DEMO-001",
            "storm_name": "Amphan",
            "simulation": "GOLDEN_REPLAY",
            "total_ticks": len(run1),
            "ticks": run1,
        }, f, indent=2)

    print_summary_table(run1)
    print(f"SUCCESS: Machine-readable replay output written to:\n  {out_file}\n")


if __name__ == "__main__":
    main()
