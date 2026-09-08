"""
Mock Structure Provider — Precomputed cyclone structural organisation metrics.

Organisation scores correlate with the intensity trajectory:
low during genesis, rising rapidly during RI, peak at mature, degrading post-landfall.
"""

from datetime import datetime

from backend.ml.interfaces import StructureProvider
from backend.ml.schemas import StructureState

# fmt: off
_STRUCTURE_DATA: list[dict] = [
    {"tick": 0,  "ts": "2020-05-16T00:00:00Z", "org": 0.20, "eye": 0.02, "sym": 0.25, "conv": 0.22, "band": 0.15, "rmw": 220, "conf": 0.60},
    {"tick": 1,  "ts": "2020-05-16T12:00:00Z", "org": 0.28, "eye": 0.04, "sym": 0.30, "conv": 0.30, "band": 0.22, "rmw": 200, "conf": 0.63},
    {"tick": 2,  "ts": "2020-05-17T00:00:00Z", "org": 0.38, "eye": 0.08, "sym": 0.38, "conv": 0.42, "band": 0.35, "rmw": 170, "conf": 0.68},
    {"tick": 3,  "ts": "2020-05-17T12:00:00Z", "org": 0.48, "eye": 0.15, "sym": 0.45, "conv": 0.52, "band": 0.45, "rmw": 140, "conf": 0.72},
    {"tick": 4,  "ts": "2020-05-18T00:00:00Z", "org": 0.62, "eye": 0.35, "sym": 0.58, "conv": 0.68, "band": 0.60, "rmw": 100, "conf": 0.78},
    {"tick": 5,  "ts": "2020-05-18T12:00:00Z", "org": 0.76, "eye": 0.60, "sym": 0.72, "conv": 0.80, "band": 0.74, "rmw": 65,  "conf": 0.84},
    {"tick": 6,  "ts": "2020-05-19T00:00:00Z", "org": 0.88, "eye": 0.82, "sym": 0.85, "conv": 0.90, "band": 0.86, "rmw": 40,  "conf": 0.90},
    {"tick": 7,  "ts": "2020-05-19T12:00:00Z", "org": 0.92, "eye": 0.95, "sym": 0.90, "conv": 0.93, "band": 0.90, "rmw": 30,  "conf": 0.92},
    {"tick": 8,  "ts": "2020-05-20T00:00:00Z", "org": 0.88, "eye": 0.88, "sym": 0.82, "conv": 0.85, "band": 0.83, "rmw": 35,  "conf": 0.88},
    {"tick": 9,  "ts": "2020-05-20T06:00:00Z", "org": 0.82, "eye": 0.78, "sym": 0.75, "conv": 0.78, "band": 0.76, "rmw": 40,  "conf": 0.84},
    {"tick": 10, "ts": "2020-05-20T10:00:00Z", "org": 0.60, "eye": 0.40, "sym": 0.50, "conv": 0.55, "band": 0.50, "rmw": 65,  "conf": 0.72},
    {"tick": 11, "ts": "2020-05-20T18:00:00Z", "org": 0.30, "eye": 0.05, "sym": 0.28, "conv": 0.25, "band": 0.20, "rmw": 120, "conf": 0.58},
]
# fmt: on


class MockStructureProvider(StructureProvider):
    def __init__(self) -> None:
        self._data = {d["tick"]: d for d in _STRUCTURE_DATA}

    def get(self, event_id: str, tick: int) -> StructureState:
        d = self._data[tick]
        return StructureState(
            event_id=event_id,
            tick=tick,
            timestamp=datetime.fromisoformat(d["ts"].replace("Z", "+00:00")),
            organization=d["org"],
            eye_probability=d["eye"],
            symmetry=d["sym"],
            convective_organization=d["conv"],
            banding=d["band"],
            rmw_km=d["rmw"],
            confidence=d["conf"],
        )
