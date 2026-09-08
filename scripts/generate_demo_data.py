"""
Generate all demo/ml/ JSON data files from the mock providers.

Run:  python scripts/generate_demo_data.py
From:  d:\\IIC
"""

import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.ml.intelligence_service import IntelligenceService

EVENT_ID = "DEMO-001"
MAX_TICK = 11
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "demo", "ml")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    svc = IntelligenceService()

    snapshots = []
    intensity_states = []
    structure_states = []
    regime_states = []
    environments = []
    change_points = []
    forecasts = []
    scenarios = []

    for tick in range(MAX_TICK + 1):
        snap = svc.get_snapshot(EVENT_ID, tick)
        snapshots.append(snap.model_dump(mode="json"))
        intensity_states.append(snap.intensity.model_dump(mode="json"))
        structure_states.append(snap.structure.model_dump(mode="json"))
        regime_states.append(snap.regime.model_dump(mode="json"))
        environments.append(snap.environment.model_dump(mode="json"))
        change_points.append(snap.change_point.model_dump(mode="json"))
        forecasts.append(snap.forecasts.model_dump(mode="json"))
        scenarios.append(snap.scenarios.model_dump(mode="json"))

    files = {
        "intelligence_snapshots.json": snapshots,
        "intensity_states.json": intensity_states,
        "structure_states.json": structure_states,
        "regime_states.json": regime_states,
        "environments.json": environments,
        "change_points.json": change_points,
        "forecasts.json": forecasts,
        "scenarios.json": scenarios,
        "analogs.json": [a.model_dump(mode="json") for a in (snap.analogs or [])],
    }

    for fname, data in files.items():
        path = os.path.join(OUT_DIR, fname)
        with open(path, "w") as f:
            json.dump(data, f, indent=2, default=str)
        print(f"  - {path}")

    print(f"\nGenerated {len(files)} files in {OUT_DIR}")


if __name__ == "__main__":
    main()
