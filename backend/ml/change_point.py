"""
Change Point Detector — Deterministic rule-based detection for the demo.

Fires when the dominant regime shifts AND there is a significant intensity
delta between consecutive ticks.

Label: DEMO CHANGE-POINT DETECTOR — not a Bayesian CPD implementation.
"""

from datetime import datetime

from backend.ml.interfaces import ChangePointProvider
from backend.ml.schemas import (
    ChangePointEvent,
    RegimeEnum,
    SeverityEnum,
)

# Precomputed change points for the demo timeline.
# Tick 4: DEVELOPING → INTENSIFYING (RI onset)
# Tick 7: INTENSIFYING → MATURE (peak reached)
# Tick 10: MATURE → WEAKENING (landfall)
_CHANGE_POINTS: dict[int, dict] = {
    4: {
        "detected": True,
        "prev": RegimeEnum.DEVELOPING,
        "new": RegimeEnum.INTENSIFYING,
        "severity": SeverityEnum.HIGH,
        "triggers": ["intensity_delta_+20kt", "regime_prob_shift_0.42", "eye_probability_jump"],
        "conf": 0.88,
    },
    7: {
        "detected": True,
        "prev": RegimeEnum.INTENSIFYING,
        "new": RegimeEnum.MATURE,
        "severity": SeverityEnum.MEDIUM,
        "triggers": ["intensity_plateau", "regime_prob_shift_0.60", "peak_organisation"],
        "conf": 0.85,
    },
    10: {
        "detected": True,
        "prev": RegimeEnum.MATURE,
        "new": RegimeEnum.WEAKENING,
        "severity": SeverityEnum.CRITICAL,
        "triggers": ["landfall_contact", "intensity_drop_-20kt", "shear_increase"],
        "conf": 0.92,
    },
}

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


class DemoChangePointProvider(ChangePointProvider):
    """Deterministic CPD: fires at precomputed ticks only."""

    def get(self, event_id: str, tick: int) -> ChangePointEvent:
        ts = datetime.fromisoformat(_TIMESTAMPS[tick].replace("Z", "+00:00"))

        if tick in _CHANGE_POINTS:
            cp = _CHANGE_POINTS[tick]
            return ChangePointEvent(
                event_id=event_id,
                tick=tick,
                timestamp=ts,
                detected=True,
                previous_regime=cp["prev"],
                new_regime=cp["new"],
                severity=cp["severity"],
                trigger_features=cp["triggers"],
                confidence=cp["conf"],
            )

        return ChangePointEvent(
            event_id=event_id,
            tick=tick,
            timestamp=ts,
            detected=False,
        )
