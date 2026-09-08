"""
Mock Regime Provider — Precomputed regime probability distributions.

Probabilities always sum to 1.0.  The dominant regime shifts from GENESIS →
DEVELOPING → INTENSIFYING → MATURE → WEAKENING across the 12-tick timeline.
"""

from datetime import datetime

from backend.ml.interfaces import RegimeProvider
from backend.ml.schemas import RegimeDistribution, RegimeEnum

# fmt: off
_REGIME_DATA: list[dict] = [
    {"tick": 0,  "ts": "2020-05-16T00:00:00Z",
     "p": {"GENESIS": 0.70, "DEVELOPING": 0.22, "INTENSIFYING": 0.05, "MATURE": 0.02, "WEAKENING": 0.01},
     "dom": "GENESIS", "conf": 0.70},
    {"tick": 1,  "ts": "2020-05-16T12:00:00Z",
     "p": {"GENESIS": 0.50, "DEVELOPING": 0.38, "INTENSIFYING": 0.08, "MATURE": 0.03, "WEAKENING": 0.01},
     "dom": "GENESIS", "conf": 0.68},
    {"tick": 2,  "ts": "2020-05-17T00:00:00Z",
     "p": {"GENESIS": 0.15, "DEVELOPING": 0.62, "INTENSIFYING": 0.18, "MATURE": 0.04, "WEAKENING": 0.01},
     "dom": "DEVELOPING", "conf": 0.72},
    {"tick": 3,  "ts": "2020-05-17T12:00:00Z",
     "p": {"GENESIS": 0.05, "DEVELOPING": 0.55, "INTENSIFYING": 0.32, "MATURE": 0.06, "WEAKENING": 0.02},
     "dom": "DEVELOPING", "conf": 0.74},
    {"tick": 4,  "ts": "2020-05-18T00:00:00Z",
     "p": {"GENESIS": 0.02, "DEVELOPING": 0.12, "INTENSIFYING": 0.74, "MATURE": 0.10, "WEAKENING": 0.02},
     "dom": "INTENSIFYING", "conf": 0.82},
    {"tick": 5,  "ts": "2020-05-18T12:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.05, "INTENSIFYING": 0.78, "MATURE": 0.14, "WEAKENING": 0.02},
     "dom": "INTENSIFYING", "conf": 0.86},
    {"tick": 6,  "ts": "2020-05-19T00:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.03, "INTENSIFYING": 0.65, "MATURE": 0.28, "WEAKENING": 0.03},
     "dom": "INTENSIFYING", "conf": 0.85},
    {"tick": 7,  "ts": "2020-05-19T12:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.02, "INTENSIFYING": 0.15, "MATURE": 0.75, "WEAKENING": 0.07},
     "dom": "MATURE", "conf": 0.88},
    {"tick": 8,  "ts": "2020-05-20T00:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.01, "INTENSIFYING": 0.08, "MATURE": 0.70, "WEAKENING": 0.20},
     "dom": "MATURE", "conf": 0.85},
    {"tick": 9,  "ts": "2020-05-20T06:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.01, "INTENSIFYING": 0.05, "MATURE": 0.58, "WEAKENING": 0.35},
     "dom": "MATURE", "conf": 0.78},
    {"tick": 10, "ts": "2020-05-20T10:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.01, "INTENSIFYING": 0.03, "MATURE": 0.20, "WEAKENING": 0.75},
     "dom": "WEAKENING", "conf": 0.80},
    {"tick": 11, "ts": "2020-05-20T18:00:00Z",
     "p": {"GENESIS": 0.01, "DEVELOPING": 0.01, "INTENSIFYING": 0.02, "MATURE": 0.06, "WEAKENING": 0.90},
     "dom": "WEAKENING", "conf": 0.88},
]
# fmt: on


class MockRegimeProvider(RegimeProvider):
    def __init__(self) -> None:
        self._data = {d["tick"]: d for d in _REGIME_DATA}

    def get(self, event_id: str, tick: int) -> RegimeDistribution:
        d = self._data[tick]
        return RegimeDistribution(
            event_id=event_id,
            tick=tick,
            timestamp=datetime.fromisoformat(d["ts"].replace("Z", "+00:00")),
            probabilities=d["p"],
            dominant_regime=RegimeEnum(d["dom"]),
            confidence=d["conf"],
        )
