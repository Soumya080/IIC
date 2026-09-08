"""
Intelligence Service — Unified facade for the entire intelligence layer.

Usage:
    svc = IntelligenceService()
    snapshot = svc.get_snapshot("DEMO-001", tick=5)
    # Returns complete IntelligenceSnapshot with all sub-fields populated.

This is the ONLY integration point Member 2 needs.
"""

from datetime import datetime

from backend.ml.change_point import DemoChangePointProvider
from backend.ml.mock_environment import MockEnvironmentProvider
from backend.ml.mock_forecast import MockForecastProvider
from backend.ml.mock_intensity import MockIntensityProvider
from backend.ml.mock_regime import MockRegimeProvider
from backend.ml.mock_scenario import MockScenarioProvider
from backend.ml.mock_structure import MockStructureProvider
from backend.ml.schemas import (
    HistoricalAnalog,
    IntelligenceSnapshot,
    LatLon,
)
from backend.ml.uncertainty import RuleBasedUncertaintyProvider

# Consensus center positions for each tick
_CENTERS: list[tuple[float, float]] = [
    (8.0, 85.0), (8.5, 85.2), (9.2, 85.5), (10.0, 85.8),
    (11.2, 86.0), (13.0, 86.3), (15.0, 86.8), (17.5, 87.2),
    (19.5, 87.8), (20.5, 88.0), (21.6, 88.3), (22.5, 88.8),
]

_TIMESTAMPS: list[str] = [
    "2020-05-16T00:00:00Z", "2020-05-16T12:00:00Z",
    "2020-05-17T00:00:00Z", "2020-05-17T12:00:00Z",
    "2020-05-18T00:00:00Z", "2020-05-18T12:00:00Z",
    "2020-05-19T00:00:00Z", "2020-05-19T12:00:00Z",
    "2020-05-20T00:00:00Z", "2020-05-20T06:00:00Z",
    "2020-05-20T10:00:00Z", "2020-05-20T18:00:00Z",
]

# Static historical analogs
_ANALOGS = [
    HistoricalAnalog(
        storm_name="Cyclone Phailin",
        year=2013,
        basin="North Indian Ocean",
        similarity=0.82,
        matched_features=["RI_over_BoB", "Odisha_landfall", "similar_SST"],
        historical_outcome="Cat-5 equivalent at peak; rapid weakening post-landfall; effective evacuation saved lives.",
    ),
    HistoricalAnalog(
        storm_name="Cyclone Fani",
        year=2019,
        basin="North Indian Ocean",
        similarity=0.78,
        matched_features=["May_season", "RI_episode", "WB_coast_threat"],
        historical_outcome="Extremely severe; landfall near Puri; significant coastal surge.",
    ),
    HistoricalAnalog(
        storm_name="Cyclone Hudhud",
        year=2014,
        basin="North Indian Ocean",
        similarity=0.71,
        matched_features=["RI_24h_window", "eye_replacement_cycle"],
        historical_outcome="Rapid intensification followed by eyewall replacement; landfall Vizag.",
    ),
]


class IntelligenceService:
    """
    Unified service that aggregates all mock providers.

    Member 2 integration:
        from backend.ml.intelligence_service import IntelligenceService
        svc = IntelligenceService()
        snap = svc.get_snapshot("DEMO-001", tick=5)
    """

    MAX_TICK = 11

    def __init__(self) -> None:
        self._intensity = MockIntensityProvider()
        self._structure = MockStructureProvider()
        self._environment = MockEnvironmentProvider()
        self._regime = MockRegimeProvider()
        self._change_point = DemoChangePointProvider()
        self._uncertainty = RuleBasedUncertaintyProvider()
        self._forecast = MockForecastProvider()
        self._scenario = MockScenarioProvider()

    def get_snapshot(self, event_id: str, tick: int) -> IntelligenceSnapshot:
        """Return the complete intelligence output for a given event-tick."""
        tick = max(0, min(tick, self.MAX_TICK))
        lat, lon = _CENTERS[tick]
        ts = datetime.fromisoformat(_TIMESTAMPS[tick].replace("Z", "+00:00"))

        return IntelligenceSnapshot(
            event_id=event_id,
            tick=tick,
            timestamp=ts,
            center=LatLon(lat=lat, lon=lon),
            intensity=self._intensity.get(event_id, tick),
            structure=self._structure.get(event_id, tick),
            environment=self._environment.get(event_id, tick),
            regime=self._regime.get(event_id, tick),
            change_point=self._change_point.get(event_id, tick),
            uncertainty=self._uncertainty.get(event_id, tick),
            forecasts=self._forecast.get(event_id, tick),
            scenarios=self._scenario.get(event_id, tick),
            analogs=_ANALOGS,
        )

    def get_current_state(self, event_id: str) -> IntelligenceSnapshot:
        """Alias — returns tick 0 by default. Backend should track current tick."""
        return self.get_snapshot(event_id, tick=0)
