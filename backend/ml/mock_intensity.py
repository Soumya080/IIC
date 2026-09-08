"""
Mock Intensity Provider — Precomputed intensity trajectory for Cyclone Amphan demo.

Trajectory is physically plausible: gradual genesis → rapid intensification →
peak → weakening at landfall.  Uncertainty bands widen during RI and near landfall.
"""

from datetime import datetime

from backend.ml.interfaces import IntensityProvider
from backend.ml.schemas import IntensityEstimate

# fmt: off
_INTENSITY_DATA: list[dict] = [
    {"tick": 0,  "ts": "2020-05-16T00:00:00Z", "kt": 30,  "lo": 25,  "hi": 35,  "hpa": 1002, "conf": 0.70},
    {"tick": 1,  "ts": "2020-05-16T12:00:00Z", "kt": 35,  "lo": 30,  "hi": 42,  "hpa": 998,  "conf": 0.72},
    {"tick": 2,  "ts": "2020-05-17T00:00:00Z", "kt": 45,  "lo": 38,  "hi": 52,  "hpa": 994,  "conf": 0.75},
    {"tick": 3,  "ts": "2020-05-17T12:00:00Z", "kt": 55,  "lo": 48,  "hi": 64,  "hpa": 988,  "conf": 0.78},
    {"tick": 4,  "ts": "2020-05-18T00:00:00Z", "kt": 75,  "lo": 65,  "hi": 88,  "hpa": 972,  "conf": 0.82},
    {"tick": 5,  "ts": "2020-05-18T12:00:00Z", "kt": 100, "lo": 88,  "hi": 115, "hpa": 954,  "conf": 0.85},
    {"tick": 6,  "ts": "2020-05-19T00:00:00Z", "kt": 125, "lo": 112, "hi": 138, "hpa": 932,  "conf": 0.88},
    {"tick": 7,  "ts": "2020-05-19T12:00:00Z", "kt": 140, "lo": 130, "hi": 150, "hpa": 920,  "conf": 0.90},
    {"tick": 8,  "ts": "2020-05-20T00:00:00Z", "kt": 135, "lo": 125, "hi": 145, "hpa": 925,  "conf": 0.88},
    {"tick": 9,  "ts": "2020-05-20T06:00:00Z", "kt": 130, "lo": 118, "hi": 140, "hpa": 930,  "conf": 0.85},
    {"tick": 10, "ts": "2020-05-20T10:00:00Z", "kt": 110, "lo": 95,  "hi": 125, "hpa": 948,  "conf": 0.80},
    {"tick": 11, "ts": "2020-05-20T18:00:00Z", "kt": 60,  "lo": 45,  "hi": 75,  "hpa": 978,  "conf": 0.75},
]
# fmt: on


class MockIntensityProvider(IntensityProvider):
    """Returns precomputed intensity estimates keyed by tick."""

    def __init__(self) -> None:
        self._data = {d["tick"]: d for d in _INTENSITY_DATA}

    def get(self, event_id: str, tick: int) -> IntensityEstimate:
        d = self._data[tick]
        return IntensityEstimate(
            event_id=event_id,
            tick=tick,
            timestamp=datetime.fromisoformat(d["ts"].replace("Z", "+00:00")),
            value_kt=d["kt"],
            lower_bound_kt=d["lo"],
            upper_bound_kt=d["hi"],
            min_pressure_hpa=d["hpa"],
            confidence=d["conf"],
        )
