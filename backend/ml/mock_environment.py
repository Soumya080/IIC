"""
Mock Environment Provider — Precomputed large-scale environmental context.

SST stays high (Bay of Bengal warm pool), shear low during intensification,
increasing as storm moves poleward and encounters dry continental air.
"""

from datetime import datetime

from backend.ml.interfaces import EnvironmentProvider
from backend.ml.schemas import EnvironmentState

# fmt: off
_ENV_DATA: list[dict] = [
    {"tick": 0,  "ts": "2020-05-16T00:00:00Z", "sst": 31.2, "shear": 18, "rh": 72, "div": 0.4, "conf": 0.80},
    {"tick": 1,  "ts": "2020-05-16T12:00:00Z", "sst": 31.3, "shear": 15, "rh": 74, "div": 0.5, "conf": 0.82},
    {"tick": 2,  "ts": "2020-05-17T00:00:00Z", "sst": 31.4, "shear": 12, "rh": 76, "div": 0.6, "conf": 0.84},
    {"tick": 3,  "ts": "2020-05-17T12:00:00Z", "sst": 31.5, "shear": 10, "rh": 78, "div": 0.7, "conf": 0.85},
    {"tick": 4,  "ts": "2020-05-18T00:00:00Z", "sst": 31.5, "shear": 8,  "rh": 80, "div": 0.8, "conf": 0.88},
    {"tick": 5,  "ts": "2020-05-18T12:00:00Z", "sst": 31.4, "shear": 7,  "rh": 82, "div": 0.9, "conf": 0.90},
    {"tick": 6,  "ts": "2020-05-19T00:00:00Z", "sst": 31.2, "shear": 8,  "rh": 80, "div": 0.8, "conf": 0.88},
    {"tick": 7,  "ts": "2020-05-19T12:00:00Z", "sst": 30.8, "shear": 10, "rh": 76, "div": 0.7, "conf": 0.85},
    {"tick": 8,  "ts": "2020-05-20T00:00:00Z", "sst": 30.4, "shear": 14, "rh": 72, "div": 0.5, "conf": 0.82},
    {"tick": 9,  "ts": "2020-05-20T06:00:00Z", "sst": 30.0, "shear": 18, "rh": 68, "div": 0.4, "conf": 0.78},
    {"tick": 10, "ts": "2020-05-20T10:00:00Z", "sst": 29.2, "shear": 25, "rh": 60, "div": 0.2, "conf": 0.72},
    {"tick": 11, "ts": "2020-05-20T18:00:00Z", "sst": 27.0, "shear": 35, "rh": 48, "div": 0.1, "conf": 0.60},
]
# fmt: on


class MockEnvironmentProvider(EnvironmentProvider):
    def __init__(self) -> None:
        self._data = {d["tick"]: d for d in _ENV_DATA}

    def get(self, event_id: str, tick: int) -> EnvironmentState:
        d = self._data[tick]
        return EnvironmentState(
            event_id=event_id,
            tick=tick,
            timestamp=datetime.fromisoformat(d["ts"].replace("Z", "+00:00")),
            sst_c=d["sst"],
            wind_shear_kt=d["shear"],
            mid_level_humidity_pct=d["rh"],
            upper_divergence=d["div"],
            confidence=d["conf"],
        )
