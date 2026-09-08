"""
Rule-based Uncertainty Provider.

Aggregates sub-component confidences into a unified uncertainty picture.
Demonstrates the required "missing MW observation → confidence drop" effect.
"""

from datetime import datetime

from backend.ml.interfaces import UncertaintyProvider
from backend.ml.schemas import UncertaintyState

# Tick 3 simulates a missing microwave pass → elevated uncertainty
_TIMESTAMPS: dict[int, str] = {
    0: "2020-05-16T00:00:00Z",
    1: "2020-05-16T12:00:00Z",
    2: "2020-05-17T00:00:00Z",
    3: "2020-05-17T12:00:00Z",
    4: "2020-05-18T00:00:00Z",
    5: "2020-05-18T12:00:00Z",
    6: "2020-05-19T00:00:00Z",
    7: "2020-05-19T12:00:00Z",
    8: "2020-05-20T00:00:00Z",
    9: "2020-05-20T06:00:00Z",
    10: "2020-05-20T10:00:00Z",
    11: "2020-05-20T18:00:00Z",
}

# fmt: off
_UNCERTAINTY_DATA: list[dict] = [
    {"tick": 0,  "int_u": 0.35, "str_u": 0.45, "reg_u": 0.35, "fc_u": 0.30, "dq": "GOOD"},
    {"tick": 1,  "int_u": 0.32, "str_u": 0.42, "reg_u": 0.38, "fc_u": 0.28, "dq": "GOOD"},
    {"tick": 2,  "int_u": 0.28, "str_u": 0.38, "reg_u": 0.32, "fc_u": 0.25, "dq": "GOOD"},
    {"tick": 3,  "int_u": 0.40, "str_u": 0.50, "reg_u": 0.42, "fc_u": 0.38, "dq": "DEGRADED_MW_MISSING"},
    {"tick": 4,  "int_u": 0.22, "str_u": 0.28, "reg_u": 0.22, "fc_u": 0.30, "dq": "GOOD"},
    {"tick": 5,  "int_u": 0.18, "str_u": 0.20, "reg_u": 0.18, "fc_u": 0.25, "dq": "GOOD"},
    {"tick": 6,  "int_u": 0.15, "str_u": 0.15, "reg_u": 0.18, "fc_u": 0.22, "dq": "GOOD"},
    {"tick": 7,  "int_u": 0.12, "str_u": 0.12, "reg_u": 0.15, "fc_u": 0.18, "dq": "GOOD"},
    {"tick": 8,  "int_u": 0.15, "str_u": 0.18, "reg_u": 0.18, "fc_u": 0.22, "dq": "GOOD"},
    {"tick": 9,  "int_u": 0.20, "str_u": 0.22, "reg_u": 0.25, "fc_u": 0.28, "dq": "GOOD"},
    {"tick": 10, "int_u": 0.30, "str_u": 0.32, "reg_u": 0.25, "fc_u": 0.35, "dq": "GOOD"},
    {"tick": 11, "int_u": 0.35, "str_u": 0.45, "reg_u": 0.18, "fc_u": 0.40, "dq": "POST_LANDFALL"},
]
# fmt: on


class RuleBasedUncertaintyProvider(UncertaintyProvider):
    def __init__(self) -> None:
        self._data = {d["tick"]: d for d in _UNCERTAINTY_DATA}

    def get(self, event_id: str, tick: int) -> UncertaintyState:
        d = self._data[tick]
        overall = (d["int_u"] + d["str_u"] + d["reg_u"] + d["fc_u"]) / 4.0
        ts = datetime.fromisoformat(_TIMESTAMPS[tick].replace("Z", "+00:00"))
        return UncertaintyState(
            event_id=event_id,
            tick=tick,
            timestamp=ts,
            intensity_uncertainty=d["int_u"],
            structure_uncertainty=d["str_u"],
            regime_uncertainty=d["reg_u"],
            forecast_spread=d["fc_u"],
            overall_uncertainty=round(overall, 3),
            data_quality_flag=d["dq"],
        )
