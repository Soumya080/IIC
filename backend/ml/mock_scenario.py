"""
Mock Scenario Provider — Deterministic scenario generation from forecast members.

Synthesises 3 named scenarios:
  A (Consensus): Weighted mean of all models — highest probability.
  B (Eastern Recurve): GFS-influenced eastward track — lower probability.
  C (Western Direct Hit): UKMET-influenced westward track — lowest probability.

Scenario probabilities evolve per tick based on regime state.
"""

from datetime import datetime
from typing import Optional

from backend.ml.interfaces import ScenarioProvider
from backend.ml.schemas import ConeGeometry, Scenario, ScenarioSet, TrackPoint

_TIMESTAMPS: dict[int, str] = {
    0: "2020-05-16T00:00:00Z", 1: "2020-05-16T12:00:00Z",
    2: "2020-05-17T00:00:00Z", 3: "2020-05-17T12:00:00Z",
    4: "2020-05-18T00:00:00Z", 5: "2020-05-18T12:00:00Z",
    6: "2020-05-19T00:00:00Z", 7: "2020-05-19T12:00:00Z",
    8: "2020-05-20T00:00:00Z", 9: "2020-05-20T06:00:00Z",
    10: "2020-05-20T10:00:00Z", 11: "2020-05-20T18:00:00Z",
}

# Consensus center positions
_CENTERS = [
    (8.0, 85.0), (8.5, 85.2), (9.2, 85.5), (10.0, 85.8),
    (11.2, 86.0), (13.0, 86.3), (15.0, 86.8), (17.5, 87.2),
    (19.5, 87.8), (20.5, 88.0), (21.6, 88.3), (22.5, 88.8),
]

# Scenario probability evolution — A/B/C probabilities per tick, always sum to 1.0
_PROBS: list[tuple[float, float, float]] = [
    (0.55, 0.25, 0.20),  # T0 — high uncertainty early
    (0.58, 0.23, 0.19),  # T1
    (0.60, 0.22, 0.18),  # T2
    (0.55, 0.28, 0.17),  # T3 — more GFS influence
    (0.50, 0.32, 0.18),  # T4 — RI onset, models disagree more
    (0.52, 0.30, 0.18),  # T5
    (0.60, 0.25, 0.15),  # T6 — consensus re-forming
    (0.68, 0.20, 0.12),  # T7 — peak, models converge
    (0.72, 0.18, 0.10),  # T8
    (0.75, 0.16, 0.09),  # T9
    (0.82, 0.12, 0.06),  # T10 — near landfall, consensus strong
    (0.90, 0.07, 0.03),  # T11 — post-landfall
]


def _build_scenario_track(
    tick: int,
    offset_lat: float,
    offset_lon: float,
    n_future: int = 4,
) -> list[TrackPoint]:
    """Build a scenario track from current position + offset into future."""
    points = []
    for step in range(n_future + 1):
        idx = tick + step
        if idx >= len(_CENTERS):
            break
        base_lat, base_lon = _CENTERS[idx]
        # Offset grows linearly with lead time
        scale = step * 0.5
        points.append(TrackPoint(
            lat=round(base_lat + offset_lat * scale, 2),
            lon=round(base_lon + offset_lon * scale, 2),
            lead_time_h=step * 12 if step > 0 else 0,
        ))
    return points


def _build_cone(track: list[TrackPoint], width_deg: float) -> Optional[ConeGeometry]:
    """Build a simple expanding cone polygon around the track."""
    if len(track) < 2:
        return None
    # Left side of cone
    left = []
    right = []
    for i, pt in enumerate(track):
        expand = width_deg * (i / max(len(track) - 1, 1))
        left.append([round(pt.lon - expand, 3), round(pt.lat + expand * 0.3, 3)])
        right.append([round(pt.lon + expand, 3), round(pt.lat - expand * 0.3, 3)])
    # Close the polygon: left forward, right backward
    coords = left + list(reversed(right)) + [left[0]]
    return ConeGeometry(coordinates=[coords])


class MockScenarioProvider(ScenarioProvider):
    def get(self, event_id: str, tick: int) -> ScenarioSet:
        ts = datetime.fromisoformat(_TIMESTAMPS[tick].replace("Z", "+00:00"))
        pa, pb, pc = _PROBS[tick]

        # Scenario A — Consensus (slight NNE bias)
        track_a = _build_scenario_track(tick, 0.0, 0.0)
        cone_a = _build_cone(track_a, 0.8)
        scenario_a = Scenario(
            scenario_id="SCEN-A",
            name="Consensus (West Bengal Landfall)",
            probability=pa,
            track=track_a,
            cone_geometry=cone_a,
            intensity_range_kt=(100, 140),
            landfall_region="West Bengal Coast (Digha–Sagar Island)",
            description="Model-weighted consensus track. Most probable path.",
        )

        # Scenario B — Eastern Recurve
        track_b = _build_scenario_track(tick, 0.1, 0.4)
        cone_b = _build_cone(track_b, 1.0)
        scenario_b = Scenario(
            scenario_id="SCEN-B",
            name="Eastern Recurve (Bangladesh Landfall)",
            probability=pb,
            track=track_b,
            cone_geometry=cone_b,
            intensity_range_kt=(95, 135),
            landfall_region="Bangladesh Coast (Sundarbans–Chittagong)",
            description="GFS-influenced track with eastern recurvature.",
        )

        # Scenario C — Western Direct Hit
        track_c = _build_scenario_track(tick, -0.1, -0.35)
        cone_c = _build_cone(track_c, 0.9)
        scenario_c = Scenario(
            scenario_id="SCEN-C",
            name="Western Track (Odisha Landfall)",
            probability=pc,
            track=track_c,
            cone_geometry=cone_c,
            intensity_range_kt=(90, 130),
            landfall_region="Odisha Coast (Paradip–Chandbali)",
            description="UKMET-influenced western track variant.",
        )

        return ScenarioSet(
            event_id=event_id,
            tick=tick,
            timestamp=ts,
            scenarios=[scenario_a, scenario_b, scenario_c],
        )
