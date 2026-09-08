"""
Mock Forecast Provider — 4 deterministic NWP forecast members with meaningful disagreement.

Models: ECMWF_HRES, GFS, UKMET, HWRF
Disagreement increases during RI (ticks 4-6) and decreases as mature eye establishes.
Each model has a consistent bias: GFS leans east, UKMET leans west, HWRF runs hot on intensity.
"""

from datetime import datetime
from math import sqrt
from typing import Optional

from backend.ml.interfaces import ForecastProvider
from backend.ml.schemas import ForecastMember, ForecastSet, TrackPoint

_TIMESTAMPS: dict[int, str] = {
    0: "2020-05-16T00:00:00Z", 1: "2020-05-16T12:00:00Z",
    2: "2020-05-17T00:00:00Z", 3: "2020-05-17T12:00:00Z",
    4: "2020-05-18T00:00:00Z", 5: "2020-05-18T12:00:00Z",
    6: "2020-05-19T00:00:00Z", 7: "2020-05-19T12:00:00Z",
    8: "2020-05-20T00:00:00Z", 9: "2020-05-20T06:00:00Z",
    10: "2020-05-20T10:00:00Z", 11: "2020-05-20T18:00:00Z",
}

# Storm center positions (consensus)
_CENTERS = [
    (8.0, 85.0), (8.5, 85.2), (9.2, 85.5), (10.0, 85.8),
    (11.2, 86.0), (13.0, 86.3), (15.0, 86.8), (17.5, 87.2),
    (19.5, 87.8), (20.5, 88.0), (21.6, 88.3), (22.5, 88.8),
]

# Model-specific biases (lat_offset, lon_offset) per lead step
_MODEL_BIASES = {
    "ECMWF_HRES": [(0.0, 0.0), (0.1, 0.05), (0.2, 0.1), (0.3, 0.15)],
    "GFS":        [(0.0, 0.0), (0.15, 0.2), (0.3, 0.5), (0.5, 0.8)],    # east bias
    "UKMET":      [(0.0, 0.0), (-0.1, -0.15), (-0.2, -0.3), (-0.4, -0.5)], # west bias
    "HWRF":       [(0.0, 0.0), (0.05, 0.1), (0.1, 0.15), (0.15, 0.2)],   # close to ECMWF
}

_MODEL_INTENSITY_BIAS = {
    "ECMWF_HRES": 0,
    "GFS": -5,      # slightly underestimates
    "UKMET": -8,     # underestimates
    "HWRF": +10,     # runs hot
}

_BASE_INTENSITY = [30, 35, 45, 55, 75, 100, 125, 140, 135, 130, 110, 60]


def _build_forecast_track(
    tick: int,
    model_name: str,
    n_lead_steps: int = 4,
) -> list[TrackPoint]:
    """Build a 4-step (12h, 24h, 36h, 48h) forecast track from the given tick."""
    biases = _MODEL_BIASES[model_name]
    int_bias = _MODEL_INTENSITY_BIAS[model_name]
    points = []
    for step in range(n_lead_steps):
        future_tick = tick + step + 1
        if future_tick >= len(_CENTERS):
            break
        base_lat, base_lon = _CENTERS[future_tick]
        b_lat, b_lon = biases[step]
        base_int = _BASE_INTENSITY[min(future_tick, len(_BASE_INTENSITY) - 1)]
        points.append(TrackPoint(
            lat=round(base_lat + b_lat, 2),
            lon=round(base_lon + b_lon, 2),
            lead_time_h=(step + 1) * 12,
            wind_kt=max(25, base_int + int_bias),
            pressure_hpa=None,
        ))
    return points


def _calc_disagreement(members: list[ForecastMember]) -> float:
    """Compute normalised disagreement score from first forecast point spread."""
    if len(members) < 2:
        return 0.0
    # Use max pairwise distance at lead_time 24h (step index 1)
    lats = []
    lons = []
    for m in members:
        if len(m.track) >= 2:
            lats.append(m.track[1].lat)
            lons.append(m.track[1].lon)
    if len(lats) < 2:
        return 0.0
    max_dist = 0.0
    for i in range(len(lats)):
        for j in range(i + 1, len(lats)):
            d = sqrt((lats[i] - lats[j]) ** 2 + (lons[i] - lons[j]) ** 2)
            if d > max_dist:
                max_dist = d
    # Normalise: 2.0 degrees ~ score 1.0
    return min(round(max_dist / 2.0, 3), 1.0)


class MockForecastProvider(ForecastProvider):
    def get(self, event_id: str, tick: int) -> ForecastSet:
        ts = datetime.fromisoformat(_TIMESTAMPS[tick].replace("Z", "+00:00"))
        members = []
        for model_name in ["ECMWF_HRES", "GFS", "UKMET", "HWRF"]:
            track = _build_forecast_track(tick, model_name)
            if not track:
                continue
            members.append(ForecastMember(
                model_name=model_name,
                init_time=ts,
                track=track,
                intensity_forecast_kt=track[0].wind_kt if track else None,
                confidence=0.85 if model_name == "ECMWF_HRES" else 0.75,
            ))
        disagreement = _calc_disagreement(members)
        return ForecastSet(
            event_id=event_id,
            tick=tick,
            timestamp=ts,
            members=members,
            disagreement_score=disagreement,
        )
